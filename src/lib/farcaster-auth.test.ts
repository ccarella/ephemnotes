import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  getQuickAuthToken,
  verifyFarcasterToken,
  generateSignInMessage,
  verifySignInMessage,
  isInFarcasterFrame,
  extractFidFromToken
} from './farcaster-auth'
import * as jose from 'jose'

vi.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    context: {
      user: {
        fid: 12345,
        username: 'testuser',
        displayName: 'Test User',
        pfpUrl: 'https://example.com/pfp.png'
      }
    },
    actions: {
      openUrl: vi.fn(),
      requestAuthToken: vi.fn()
    }
  }
}))

vi.mock('jose')

describe('Farcaster Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset window.location
    const globalAny = global as { window?: Window }
    delete globalAny.window
    global.window = {
      location: {
        href: 'https://example.com'
      }
    } as Window & typeof globalThis
  })

  describe('isInFarcasterFrame', () => {
    it('should return true when in Farcaster frame', () => {
      global.window.location.href = 'https://example.com?embed=true'
      expect(isInFarcasterFrame()).toBe(true)
    })

    it('should return false when not in Farcaster frame', () => {
      global.window.location.href = 'https://example.com'
      expect(isInFarcasterFrame()).toBe(false)
    })

    it('should return false when window is undefined', () => {
      const globalAny = global as { window?: Window }
      delete globalAny.window
      expect(isInFarcasterFrame()).toBe(false)
    })
  })

  describe('getQuickAuthToken', () => {
    it('should request and return auth token successfully', async () => {
      const mockToken = 'mock-auth-token'
      const { sdk } = await import('@farcaster/frame-sdk')
      sdk.actions.requestAuthToken = vi.fn().mockResolvedValue({
        token: mockToken
      })

      const result = await getQuickAuthToken()
      
      expect(sdk.actions.requestAuthToken).toHaveBeenCalled()
      expect(result).toEqual({ token: mockToken })
    })

    it('should handle errors when requesting auth token', async () => {
      const { sdk } = await import('@farcaster/frame-sdk')
      sdk.actions.requestAuthToken = vi.fn().mockRejectedValue(new Error('Auth failed'))

      await expect(getQuickAuthToken()).rejects.toThrow('Failed to get Farcaster auth token')
    })

    it('should handle when token is not returned', async () => {
      const { sdk } = await import('@farcaster/frame-sdk')
      sdk.actions.requestAuthToken = vi.fn().mockResolvedValue({})

      await expect(getQuickAuthToken()).rejects.toThrow('No token received from Farcaster')
    })
  })

  describe('verifyFarcasterToken', () => {
    it('should verify a valid JWT token', async () => {
      const mockPayload = {
        fid: 12345,
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) + 3600
      }
      
      vi.mocked(jose.jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'HS256' }
      })

      const result = await verifyFarcasterToken('valid-token', 'secret')
      
      expect(result).toEqual({
        valid: true,
        payload: mockPayload
      })
    })

    it('should handle invalid token', async () => {
      vi.mocked(jose.jwtVerify).mockRejectedValue(new Error('Invalid token'))

      const result = await verifyFarcasterToken('invalid-token', 'secret')
      
      expect(result).toEqual({
        valid: false,
        error: 'Invalid token'
      })
    })

    it('should handle expired token', async () => {
      const mockPayload = {
        fid: 12345,
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      }
      
      vi.mocked(jose.jwtVerify).mockResolvedValue({
        payload: mockPayload,
        protectedHeader: { alg: 'HS256' }
      })

      const result = await verifyFarcasterToken('expired-token', 'secret')
      
      expect(result).toEqual({
        valid: false,
        error: 'Token expired'
      })
    })
  })

  describe('generateSignInMessage', () => {
    it('should generate a sign-in message with all required fields', () => {
      const params = {
        domain: 'example.com',
        address: '0x1234567890abcdef',
        statement: 'Sign in to EphemNotes',
        uri: 'https://example.com',
        version: '1',
        chainId: 1,
        nonce: 'abc123',
        issuedAt: '2024-01-01T00:00:00Z'
      }

      const message = generateSignInMessage(params)
      
      expect(message).toContain(params.domain)
      expect(message).toContain(params.address)
      expect(message).toContain(params.statement)
      expect(message).toContain(params.uri)
      expect(message).toContain(`Version: ${params.version}`)
      expect(message).toContain(`Chain ID: ${params.chainId}`)
      expect(message).toContain(`Nonce: ${params.nonce}`)
      expect(message).toContain(`Issued At: ${params.issuedAt}`)
    })

    it('should generate message with optional expiration time', () => {
      const params = {
        domain: 'example.com',
        address: '0x1234',
        statement: 'Sign in',
        uri: 'https://example.com',
        version: '1',
        chainId: 1,
        nonce: 'abc123',
        issuedAt: '2024-01-01T00:00:00Z',
        expirationTime: '2024-01-02T00:00:00Z'
      }

      const message = generateSignInMessage(params)
      
      expect(message).toContain(`Expiration Time: ${params.expirationTime}`)
    })
  })

  describe('verifySignInMessage', () => {
    it('should verify a valid signature', async () => {
      const message = 'Test message'
      const signature = '0xvalidsignature'
      const expectedAddress = '0x1234567890abcdef'

      // Mock crypto verification to return expected address
      global.crypto = {
        subtle: {
          digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
        }
      } as Crypto

      const result = await verifySignInMessage(message, signature, expectedAddress)
      
      expect(result).toEqual({
        valid: true,
        address: expectedAddress
      })
    })

    it('should handle invalid signature', async () => {
      const message = 'Test message'
      const signature = '0xinvalidsignature'
      const expectedAddress = '0x1234567890abcdef'

      global.crypto = {
        subtle: {
          digest: vi.fn().mockRejectedValue(new Error('Invalid signature'))
        }
      } as Crypto

      const result = await verifySignInMessage(message, signature, expectedAddress)
      
      expect(result).toEqual({
        valid: false,
        error: 'Invalid signature'
      })
    })
  })

  describe('extractFidFromToken', () => {
    it('should extract FID from valid JWT token', () => {
      const token = 'header.' + btoa(JSON.stringify({ fid: 12345 })) + '.signature'
      
      const fid = extractFidFromToken(token)
      
      expect(fid).toBe(12345)
    })

    it('should return null for invalid token format', () => {
      const token = 'invalid-token'
      
      const fid = extractFidFromToken(token)
      
      expect(fid).toBeNull()
    })

    it('should return null when FID is missing', () => {
      const token = 'header.' + btoa(JSON.stringify({ username: 'test' })) + '.signature'
      
      const fid = extractFidFromToken(token)
      
      expect(fid).toBeNull()
    })

    it('should handle malformed payload', () => {
      const token = 'header.invalid-base64.signature'
      
      const fid = extractFidFromToken(token)
      
      expect(fid).toBeNull()
    })
  })
})