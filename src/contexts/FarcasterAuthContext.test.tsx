import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { FarcasterAuthProvider, useFarcasterAuth } from './FarcasterAuthContext'
import { useAuth } from './AuthContext'
import * as farcasterAuth from '@/lib/farcaster-auth'

vi.mock('./AuthContext')
vi.mock('@/lib/farcaster-auth')
vi.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    context: {
      user: {
        fid: 12345,
        username: 'testuser',
        displayName: 'Test User',
        pfpUrl: 'https://example.com/pfp.png'
      }
    }
  }
}))

const mockUseAuth = {
  user: null,
  session: null,
  loading: false,
  error: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signOut: vi.fn()
}

describe('FarcasterAuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue(mockUseAuth)
    vi.mocked(farcasterAuth.isInFarcasterFrame).mockReturnValue(true)
  })

  describe('FarcasterAuthProvider', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      expect(result.current.isInFrame).toBe(true)
      expect(result.current.farcasterUser).toEqual({
        fid: 12345,
        username: 'testuser',
        displayName: 'Test User',
        pfpUrl: 'https://example.com/pfp.png'
      })
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('detects when not in Farcaster frame', () => {
      vi.mocked(farcasterAuth.isInFarcasterFrame).mockReturnValue(false)

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      expect(result.current.isInFrame).toBe(false)
      expect(result.current.farcasterUser).toBeNull()
    })

    it('passes through existing auth state', () => {
      const mockSession = { 
        access_token: 'token',
        user: { id: 'user-123' }
      }
      vi.mocked(useAuth).mockReturnValue({
        ...mockUseAuth,
        user: mockSession.user as ReturnType<typeof useAuth>['user'],
        session: mockSession as ReturnType<typeof useAuth>['session']
      })

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      expect(result.current.user).toEqual(mockSession.user)
      expect(result.current.session).toEqual(mockSession)
    })
  })

  describe('authenticateWithQuickAuth', () => {
    it('successfully authenticates with quick auth', async () => {
      const mockToken = 'mock-farcaster-token'
      const mockResponse = {
        access_token: 'mock-access-token',
        user: { id: 'user-123', fid: 12345 }
      }

      vi.mocked(farcasterAuth.getQuickAuthToken).mockResolvedValue({ token: mockToken })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      }) as typeof global.fetch

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await result.current.authenticateWithQuickAuth()
      })

      expect(farcasterAuth.getQuickAuthToken).toHaveBeenCalled()
      expect(fetch).toHaveBeenCalledWith('/api/auth/farcaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mockToken, type: 'quick' })
      })
    })

    it('handles quick auth errors', async () => {
      vi.mocked(farcasterAuth.getQuickAuthToken).mockRejectedValue(
        new Error('Failed to get token')
      )

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await expect(result.current.authenticateWithQuickAuth()).rejects.toThrow(
          'Quick auth failed'
        )
      })

      expect(result.current.error).toBe('Quick auth failed')
    })

    it('handles API errors during quick auth', async () => {
      const mockToken = 'mock-farcaster-token'
      vi.mocked(farcasterAuth.getQuickAuthToken).mockResolvedValue({ token: mockToken })
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      }) as typeof global.fetch

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await expect(result.current.authenticateWithQuickAuth()).rejects.toThrow(
          'Authentication failed'
        )
      })
    })

    it('does not authenticate if not in frame', async () => {
      vi.mocked(farcasterAuth.isInFarcasterFrame).mockReturnValue(false)

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await expect(result.current.authenticateWithQuickAuth()).rejects.toThrow(
          'Not in Farcaster frame'
        )
      })

      expect(farcasterAuth.getQuickAuthToken).not.toHaveBeenCalled()
    })
  })

  describe('authenticateWithSIWF', () => {
    it('successfully authenticates with SIWF', async () => {
      const mockMessage = 'Sign this message'
      const mockSignature = '0xsignature'
      const mockResponse = {
        access_token: 'mock-access-token',
        user: { id: 'user-123', fid: 12345 }
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      }) as typeof global.fetch

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await result.current.authenticateWithSIWF(mockMessage, mockSignature)
      })

      expect(fetch).toHaveBeenCalledWith('/api/auth/farcaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: mockMessage, 
          signature: mockSignature, 
          type: 'siwf' 
        })
      })
    })

    it('handles SIWF authentication errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid signature' })
      }) as typeof global.fetch

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await expect(
          result.current.authenticateWithSIWF('message', '0xsig')
        ).rejects.toThrow('SIWF authentication failed')
      })
    })
  })

  describe('loading and error states', () => {
    it('manages loading state during authentication', async () => {
      const mockToken = 'mock-farcaster-token'
      vi.mocked(farcasterAuth.getQuickAuthToken).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ token: mockToken }), 100))
      )
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'token', user: {} })
      }) as typeof global.fetch

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      expect(result.current.loading).toBe(false)

      // Start the authentication without awaiting
      let authPromise: Promise<void>
      act(() => {
        authPromise = result.current.authenticateWithQuickAuth()
      })

      // Check loading state immediately after starting
      expect(result.current.loading).toBe(true)

      // Wait for the authentication to complete
      await act(async () => {
        await authPromise
      })

      expect(result.current.loading).toBe(false)
    })

    it('clears error on successful authentication', async () => {
      // First, trigger an error
      vi.mocked(farcasterAuth.getQuickAuthToken).mockRejectedValueOnce(
        new Error('First attempt failed')
      )

      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        try {
          await result.current.authenticateWithQuickAuth()
        } catch {}
      })

      expect(result.current.error).toBe('Quick auth failed')

      // Then succeed
      vi.mocked(farcasterAuth.getQuickAuthToken).mockResolvedValue({ token: 'token' })
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: 'token', user: {} })
      }) as typeof global.fetch

      await act(async () => {
        await result.current.authenticateWithQuickAuth()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('useAuth integration', () => {
    it('calls underlying auth methods', async () => {
      const { result } = renderHook(() => useFarcasterAuth(), {
        wrapper: FarcasterAuthProvider
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password')
      })

      expect(mockUseAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password')

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockUseAuth.signOut).toHaveBeenCalled()
    })
  })

  describe('hook usage validation', () => {
    it('throws error when used outside provider', () => {
      const { result } = renderHook(() => useFarcasterAuth())

      expect(result.error).toEqual(
        Error('useFarcasterAuth must be used within a FarcasterAuthProvider')
      )
    })
  })
})