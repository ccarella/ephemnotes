import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import { AuthModal } from '@/components/AuthModal'
import { AuthProvider } from '@/contexts/AuthContext'
import { FarcasterAuthProvider } from '@/contexts/FarcasterAuthContext'
import { ToastProvider } from '@/lib/toast'
import SupabaseProvider from '@/providers/supabase-provider'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock Farcaster SDK
vi.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    actions: {
      requestAuthToken: vi.fn(() => Promise.resolve({ token: 'mock-farcaster-token' })),
    },
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

// Mock window location for frame detection
vi.mock('@/lib/farcaster-auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/farcaster-auth')>('@/lib/farcaster-auth')
  return {
    ...actual,
    isInFarcasterFrame: vi.fn(() => false),
    getQuickAuthToken: vi.fn(() => Promise.resolve({ token: 'mock-farcaster-token' })),
  }
})

// Setup MSW server
const server = setupServer(
  http.post('/api/auth/farcaster', async ({ request }) => {
    const body = await request.json() as { type: string; token?: string; message?: string; signature?: string }
    
    if (body.type === 'quick' && body.token === 'mock-farcaster-token') {
      return HttpResponse.json({
        user: {
          id: 'test-user-id',
          email: 'testuser@farcaster.xyz',
          user_metadata: { fid: 12345, username: 'testuser' },
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
      })
    }
    
    if (body.type === 'siwf') {
      return HttpResponse.json({
        user: {
          id: 'test-user-id',
          email: 'testuser@farcaster.xyz',
          user_metadata: { fid: 12345, username: 'testuser' },
        },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
        },
      })
    }
    
    return HttpResponse.json({ error: 'Invalid auth type' }, { status: 400 })
  })
)

beforeEach(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

describe('Farcaster Authentication Integration', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <SupabaseProvider>
      <AuthProvider>
        <FarcasterAuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </FarcasterAuthProvider>
      </AuthProvider>
    </SupabaseProvider>
  )

  it('completes full Quick Auth flow successfully', async () => {
    const mockOnClose = vi.fn()
    
    render(
      <TestWrapper>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    )

    // Click on Sign in with Farcaster button
    const farcasterButton = await screen.findByText('Sign in with Farcaster')
    await userEvent.click(farcasterButton)

    // Wait for authentication to complete
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })

    // Verify success toast was shown
    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    })
  })

  it('handles authentication errors gracefully', async () => {
    // Override server handler to return error
    server.use(
      http.post('/api/auth/farcaster', () => {
        return HttpResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        )
      })
    )

    const mockOnClose = vi.fn()
    
    render(
      <TestWrapper>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    )

    // Click on Sign in with Farcaster button
    const farcasterButton = await screen.findByText('Sign in with Farcaster')
    await userEvent.click(farcasterButton)

    // Verify error toast was shown
    await waitFor(() => {
      expect(screen.getByText('Authentication failed')).toBeInTheDocument()
    })

    // Modal should remain open on error
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('shows Quick Auth button when in Farcaster frame', async () => {
    // Mock isInFarcasterFrame to return true
    const { isInFarcasterFrame } = await import('@/lib/farcaster-auth')
    ;(isInFarcasterFrame as vi.Mock).mockReturnValue(true)

    render(
      <TestWrapper>
        <AuthModal isOpen={true} onClose={vi.fn()} />
      </TestWrapper>
    )

    // Should show Quick Auth button instead of Sign in with Farcaster
    await waitFor(() => {
      expect(screen.getByText('Quick Auth with Farcaster')).toBeInTheDocument()
    })
  })

  it('creates new user on first Farcaster sign in', async () => {
    const mockOnClose = vi.fn()
    
    // Override server handler to simulate new user creation
    server.use(
      http.post('/api/auth/farcaster', async () => {
        return HttpResponse.json({
          user: {
            id: 'new-user-id',
            email: 'newuser@farcaster.xyz',
            user_metadata: { fid: 67890, username: 'newuser' },
            created_at: new Date().toISOString(),
          },
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
          },
          isNewUser: true,
        })
      })
    )

    render(
      <TestWrapper>
        <AuthModal isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    )

    const farcasterButton = await screen.findByText('Sign in with Farcaster')
    await userEvent.click(farcasterButton)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })

    // Verify welcome message for new user
    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    })
  })

  it('handles network errors during authentication', async () => {
    // Simulate network error
    server.use(
      http.post('/api/auth/farcaster', () => {
        return HttpResponse.error()
      })
    )

    render(
      <TestWrapper>
        <AuthModal isOpen={true} onClose={vi.fn()} />
      </TestWrapper>
    )

    const farcasterButton = await screen.findByText('Sign in with Farcaster')
    await userEvent.click(farcasterButton)

    // Should show generic error message
    await waitFor(() => {
      expect(screen.getByText(/Authentication failed/i)).toBeInTheDocument()
    })
  })
})