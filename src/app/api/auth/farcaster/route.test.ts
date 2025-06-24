import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import * as farcasterAuth from '@/lib/farcaster-auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import * as jose from 'jose'

vi.mock('@/lib/supabase')
vi.mock('@/lib/farcaster-auth')
vi.mock('jose')

const mockSupabase = {
  auth: {
    signInWithCustomToken: vi.fn(),
    admin: {
      createUser: vi.fn(),
      generateLink: vi.fn()
    }
  },
  from: vi.fn()
} as const

describe('POST /api/auth/farcaster', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as ReturnType<typeof createServerSupabaseClient>)
    
    // Set up environment variables
    process.env.FARCASTER_JWT_SECRET = 'test-secret'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  describe('Quick Auth flow', () => {
    it('should authenticate user with valid quick auth token', async () => {
      const mockFid = 12345
      const mockToken = 'valid-farcaster-token'
      const mockUser = {
        id: 'user-123',
        email: `fid-${mockFid}@farcaster.ephemnotes.com`,
        user_metadata: { fid: mockFid, username: 'testuser' }
      }

      vi.mocked(farcasterAuth.verifyFarcasterToken).mockResolvedValue({
        valid: true,
        payload: { fid: mockFid, username: 'testuser' }
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      })

      vi.mocked(jose.SignJWT).mockImplementation(() => ({
        setProtectedHeader: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue('signed-jwt-token')
      } as unknown as jose.SignJWT))

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: mockToken, type: 'quick' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        access_token: 'signed-jwt-token',
        user: mockUser
      })
      expect(farcasterAuth.verifyFarcasterToken).toHaveBeenCalledWith(
        mockToken,
        'test-secret'
      )
    })

    it('should create new user if not exists', async () => {
      const mockFid = 12345
      const mockToken = 'valid-farcaster-token'
      const mockNewUser = {
        id: 'new-user-123',
        email: `fid-${mockFid}@farcaster.ephemnotes.com`,
        user_metadata: { fid: mockFid, username: 'newuser' }
      }

      vi.mocked(farcasterAuth.verifyFarcasterToken).mockResolvedValue({
        valid: true,
        payload: { fid: mockFid, username: 'newuser' }
      })

      // User not found
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      })

      // Create user
      mockSupabase.auth.admin.createUser.mockResolvedValue({
        data: { user: mockNewUser },
        error: null
      })

      // Insert profile
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      })

      vi.mocked(jose.SignJWT).mockImplementation(() => ({
        setProtectedHeader: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue('signed-jwt-token')
      } as unknown as jose.SignJWT))

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: mockToken, type: 'quick' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        access_token: 'signed-jwt-token',
        user: mockNewUser
      })
      expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith({
        email: `fid-${mockFid}@farcaster.ephemnotes.com`,
        email_confirm: true,
        user_metadata: {
          fid: mockFid,
          username: 'newuser'
        }
      })
    })

    it('should handle invalid token', async () => {
      vi.mocked(farcasterAuth.verifyFarcasterToken).mockResolvedValue({
        valid: false,
        error: 'Invalid token'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token', type: 'quick' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Invalid Farcaster token' })
    })
  })

  describe('SIWF flow', () => {
    it('should authenticate user with valid SIWF signature', async () => {
      const mockMessage = 'Sign in to EphemNotes'
      const mockSignature = '0xvalidsignature'
      const mockAddress = '0x1234567890abcdef'
      const mockFid = 12345
      const mockUser = {
        id: 'user-123',
        email: `fid-${mockFid}@farcaster.ephemnotes.com`,
        user_metadata: { fid: mockFid, username: 'testuser', address: mockAddress }
      }

      vi.mocked(farcasterAuth.verifySignInMessage).mockResolvedValue({
        valid: true,
        address: mockAddress
      })

      // Mock parsing FID from message
      vi.mocked(farcasterAuth.extractFidFromToken).mockReturnValue(mockFid)

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      })

      vi.mocked(jose.SignJWT).mockImplementation(() => ({
        setProtectedHeader: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue('signed-jwt-token')
      } as unknown as jose.SignJWT))

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ 
          message: mockMessage, 
          signature: mockSignature, 
          type: 'siwf' 
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        access_token: 'signed-jwt-token',
        user: mockUser
      })
      expect(farcasterAuth.verifySignInMessage).toHaveBeenCalledWith(
        mockMessage,
        mockSignature,
        expect.any(String)
      )
    })

    it('should handle invalid SIWF signature', async () => {
      vi.mocked(farcasterAuth.verifySignInMessage).mockResolvedValue({
        valid: false,
        error: 'Invalid signature'
      })

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'message', 
          signature: '0xinvalid', 
          type: 'siwf' 
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Invalid signature' })
    })
  })

  describe('Error handling', () => {
    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: 'invalid json'
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid request body' })
    })

    it('should return 400 for missing type', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: 'token' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid authentication type' })
    })

    it('should return 400 for invalid type', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ type: 'invalid' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid authentication type' })
    })

    it('should return 500 for missing environment variables', async () => {
      delete process.env.FARCASTER_JWT_SECRET

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: 'token', type: 'quick' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Server configuration error' })
    })

    it('should handle database errors', async () => {
      vi.mocked(farcasterAuth.verifyFarcasterToken).mockResolvedValue({
        valid: true,
        payload: { fid: 12345, username: 'testuser' }
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error'))
      })

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: 'token', type: 'quick' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Authentication failed' })
    })
  })

  describe('JWT generation', () => {
    it('should generate JWT with correct claims', async () => {
      const mockFid = 12345
      const mockUser = {
        id: 'user-123',
        email: `fid-${mockFid}@farcaster.ephemnotes.com`,
        user_metadata: { fid: mockFid, username: 'testuser' }
      }

      vi.mocked(farcasterAuth.verifyFarcasterToken).mockResolvedValue({
        valid: true,
        payload: { fid: mockFid, username: 'testuser' }
      })

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      })

      const mockSign = vi.fn().mockResolvedValue('signed-jwt-token')
      const mockSetExpirationTime = vi.fn().mockReturnThis()
      const mockSetIssuedAt = vi.fn().mockReturnThis()
      const mockSetProtectedHeader = vi.fn().mockReturnThis()

      vi.mocked(jose.SignJWT).mockImplementation(() => ({
        setProtectedHeader: mockSetProtectedHeader,
        setIssuedAt: mockSetIssuedAt,
        setExpirationTime: mockSetExpirationTime,
        sign: mockSign
      } as unknown as jose.SignJWT))

      const request = new NextRequest('http://localhost:3000/api/auth/farcaster', {
        method: 'POST',
        body: JSON.stringify({ token: 'token', type: 'quick' })
      })

      await POST(request)

      expect(jose.SignJWT).toHaveBeenCalledWith({
        sub: mockUser.id,
        fid: mockFid,
        username: 'testuser',
        email: mockUser.email
      })
      expect(mockSetProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' })
      expect(mockSetIssuedAt).toHaveBeenCalled()
      expect(mockSetExpirationTime).toHaveBeenCalledWith('24h')
    })
  })
})