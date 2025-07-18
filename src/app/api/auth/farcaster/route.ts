import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { createErrorResponse, parseRequestBody } from '@/lib/api-utils'
import {
  verifyFarcasterToken,
  verifySignInMessage,
  extractFidFromToken
} from '@/lib/farcaster-auth'
import * as jose from 'jose'

interface QuickAuthRequest {
  type: 'quick'
  token: string
}

interface SIWFAuthRequest {
  type: 'siwf'
  message: string
  signature: string
}

type AuthRequest = QuickAuthRequest | SIWFAuthRequest

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await parseRequestBody<AuthRequest>(request)
    if (!body) {
      return createErrorResponse('Invalid request body', 400)
    }

    // Validate authentication type
    if (!body.type || !['quick', 'siwf'].includes(body.type)) {
      return createErrorResponse('Invalid authentication type', 400)
    }

    // Get environment variables
    const jwtSecret = process.env.FARCASTER_JWT_SECRET
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!jwtSecret || !serviceRoleKey) {
      console.error('Missing required environment variables')
      return createErrorResponse('Server configuration error', 500)
    }

    const supabase = await createServerSupabaseClient()
    
    let fid: number | undefined
    let username: string | undefined
    let address: string | undefined

    // Handle Quick Auth flow
    if (body.type === 'quick' && 'token' in body) {
      const verification = await verifyFarcasterToken(body.token, jwtSecret)
      
      if (!verification.valid || !verification.payload) {
        return createErrorResponse('Invalid Farcaster token', 401)
      }

      fid = verification.payload.fid
      username = verification.payload.username
      
      // Ensure we have required fields
      if (!fid) {
        return createErrorResponse('Missing FID in token', 400)
      }
    } 
    // Handle SIWF flow
    else if (body.type === 'siwf' && 'message' in body && 'signature' in body) {
      // Extract address from message (simplified - in production parse properly)
      const addressMatch = body.message.match(/0x[a-fA-F0-9]{40}/)
      if (!addressMatch) {
        return createErrorResponse('Invalid message format', 400)
      }
      
      address = addressMatch[0]
      const verification = await verifySignInMessage(
        body.message,
        body.signature,
        address
      )
      
      if (!verification.valid) {
        return createErrorResponse('Invalid signature', 401)
      }

      // Extract FID from message or generate a temporary one
      // In production, this would be parsed from the message
      const extractedFid = extractFidFromToken(body.message)
      fid = extractedFid || Math.floor(Date.now() / 1000) // Use timestamp as fallback FID
    } else {
      return createErrorResponse('Invalid request format', 400)
    }
    
    // Ensure we have a valid FID at this point
    if (!fid) {
      return createErrorResponse('Unable to determine FID', 400)
    }

    // Check if user exists by FID
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('fid', fid)
      .single()

    let user
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new one
      const email = `fid-${fid}@farcaster.ephemnotes.com`
      
      const { data: authData, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          fid,
          username,
          address
        }
      })

      if (createError || !authData.user) {
        console.error('Failed to create user:', createError)
        return createErrorResponse('Failed to create user', 500)
      }

      user = authData.user

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username || `fid-${fid}`,
          fid
        })

      if (profileError) {
        console.error('Failed to create profile:', profileError)
      }
    } else if (!fetchError && existingProfile) {
      // Get the auth user by ID
      const { data: authData, error: authError } = await supabase.auth.admin.getUserById(existingProfile.id)
      
      if (authError || !authData.user) {
        console.error('Failed to get auth user:', authError)
        return createErrorResponse('Authentication failed', 500)
      }
      
      user = authData.user
    } else {
      console.error('Database error:', fetchError)
      return createErrorResponse('Authentication failed', 500)
    }

    // Generate JWT token for the user
    const secretKey = new TextEncoder().encode(jwtSecret)
    const jwt = await new jose.SignJWT({
      sub: user.id,
      fid,
      username: username || existingProfile?.username || `fid-${fid}`,
      email: user.email || ''
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey)

    // Return success response
    return new Response(
      JSON.stringify({
        access_token: jwt,
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            fid,
            username: username || existingProfile?.username || `fid-${fid}`,
            address
          }
        }
      }),
      {
        status: existingProfile ? 200 : 201,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Farcaster auth error:', error)
    return createErrorResponse('Authentication failed', 500)
  }
}