import { describe, it, expect, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth, useUser } from './AuthContext'
import { useSupabase } from '@/providers/supabase-provider'

vi.mock('@/providers/supabase-provider')

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}

const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
  },
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSupabase).mockReturnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase: mockSupabase as any,
    })
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })
  })

  describe('AuthProvider', () => {
    it('initializes with loading state', () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })

    it('loads existing session on mount', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockSession.user)
      expect(result.current.session).toEqual(mockSession)
    })

    it('handles no Supabase client gracefully', async () => {
      vi.mocked(useSupabase).mockReturnValue({
        supabase: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })
  })

  describe('signIn', () => {
    it('signs in user successfully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('handles sign in error', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
      const mockError = {
        message: 'Invalid credentials',
        name: 'AuthError',
        status: 400,
      }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // The signIn should throw an error
      await expect(
        act(async () => {
          await result.current.signIn('test@example.com', 'wrongpassword')
        })
      ).rejects.toEqual(mockError)
    })
  })

  describe('signUp', () => {
    it('signs up user successfully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockSession.user, session: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signUp('newuser@example.com', 'password123')
      })

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })

  describe('signOut', () => {
    it('signs out user successfully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })
      mockSupabase.auth.signOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })

  describe('useUser hook', () => {
    it('returns the current user', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      })

      const { result } = renderHook(() => useUser(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current).toEqual(mockSession.user)
      })
    })

    it('returns null when no user is signed in', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      })

      const { result } = renderHook(() => useUser(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current).toBe(null)
      })
    })
  })

  describe('auth state change listener', () => {
    it('updates state when auth state changes', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let authChangeCallback: any
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authChangeCallback = callback
        return {
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        }
      })
      mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        authChangeCallback('SIGNED_IN', mockSession)
      })

      expect(result.current.user).toEqual(mockSession.user)
      expect(result.current.session).toEqual(mockSession)
    })
  })
})