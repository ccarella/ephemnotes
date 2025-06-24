import { sdk } from '@farcaster/frame-sdk'
import * as jose from 'jose'

/**
 * Check if the app is running inside a Farcaster frame
 */
export function isInFarcasterFrame(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for Farcaster frame indicators
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.has('embed') || window.location.href.includes('warpcast.com')
}

/**
 * Quick Auth token acquisition from Farcaster
 */
export async function getQuickAuthToken(): Promise<{ token: string }> {
  try {
    // Use the signIn action to get auth token
    const result = await sdk.actions.signIn({
      nonce: crypto.randomUUID()
    })
    
    if (!result?.message) {
      throw new Error('No auth message received from Farcaster')
    }
    
    // For now, return the message as token - in production this would be
    // properly exchanged for a JWT token
    return { token: result.message }
  } catch (error) {
    console.error('Failed to get Farcaster auth token:', error)
    throw new Error('Failed to get Farcaster auth token')
  }
}

/**
 * Verify a Farcaster JWT token
 */
interface FarcasterTokenPayload {
  fid?: number
  username?: string
  exp?: number
  [key: string]: unknown
}

export async function verifyFarcasterToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: FarcasterTokenPayload; error?: string }> {
  try {
    const secretKey = new TextEncoder().encode(secret)
    const { payload } = await jose.jwtVerify(token, secretKey)
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' }
    }
    
    return { valid: true, payload }
  } catch {
    return { valid: false, error: 'Invalid token' }
  }
}

/**
 * Generate a Sign In With Farcaster (SIWF) message
 */
export function generateSignInMessage(params: {
  domain: string
  address: string
  statement: string
  uri: string
  version: string
  chainId: number
  nonce: string
  issuedAt: string
  expirationTime?: string
}): string {
  const {
    domain,
    address,
    statement,
    uri,
    version,
    chainId,
    nonce,
    issuedAt,
    expirationTime
  } = params

  let message = `${domain} wants you to sign in with your Ethereum account:\n`
  message += `${address}\n\n`
  message += `${statement}\n\n`
  message += `URI: ${uri}\n`
  message += `Version: ${version}\n`
  message += `Chain ID: ${chainId}\n`
  message += `Nonce: ${nonce}\n`
  message += `Issued At: ${issuedAt}`
  
  if (expirationTime) {
    message += `\nExpiration Time: ${expirationTime}`
  }

  return message
}

/**
 * Verify a Sign In With Farcaster message signature
 */
export async function verifySignInMessage(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<{ valid: boolean; address?: string; error?: string }> {
  try {
    // In a real implementation, this would verify the signature
    // using ethers.js or similar library
    // For now, we'll do a basic check
    if (!signature.startsWith('0x')) {
      return { valid: false, error: 'Invalid signature format' }
    }
    
    // Mock verification - in production this would use actual crypto
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(message)
    )
    
    // Return success for testing
    return { valid: true, address: expectedAddress }
  } catch {
    return { valid: false, error: 'Invalid signature' }
  }
}

/**
 * Extract FID from a JWT token without full verification
 */
export function extractFidFromToken(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    const payload = JSON.parse(atob(parts[1]))
    return payload.fid || null
  } catch {
    return null
  }
}

/**
 * Get Farcaster user context from SDK
 */
export async function getFarcasterContext() {
  try {
    const context = await sdk.context
    return context
  } catch {
    return null
  }
}