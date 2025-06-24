import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from './AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext'
import { useToast } from '@/lib/toast'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@/contexts/AuthContext')
vi.mock('@/contexts/FarcasterAuthContext')
vi.mock('@/lib/toast')
vi.mock('next/navigation')

describe('AuthModal', () => {
  const mockOnClose = vi.fn()
  const mockSignIn = vi.fn()
  const mockSignInWithMagicLink = vi.fn()
  const mockQuickAuth = vi.fn()
  const mockSignInWithFarcaster = vi.fn()
  const mockToast = { error: vi.fn(), success: vi.fn() }
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as vi.Mock).mockReturnValue({
      signIn: mockSignIn,
      signInWithMagicLink: mockSignInWithMagicLink,
      loading: false
    })
    ;(useFarcasterAuth as vi.Mock).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMagicLink: mockSignInWithMagicLink,
      isInFrame: false,
      farcasterUser: null,
      authenticateWithQuickAuth: mockQuickAuth,
      authenticateWithSIWF: mockSignInWithFarcaster,
      quickAuth: mockQuickAuth,
      signInWithFarcaster: mockSignInWithFarcaster,
      isInFarcasterFrame: false
    })
    ;(useToast as vi.Mock).mockReturnValue({ toast: mockToast })
    ;(useRouter as vi.Mock).mockReturnValue({ push: mockPush })
  })

  it('renders sign in mode by default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('shows Farcaster sign in button when not in frame', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Sign in with Farcaster')).toBeInTheDocument()
  })

  it('shows Quick Auth button when in Farcaster frame', () => {
    ;(useFarcasterAuth as vi.Mock).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMagicLink: mockSignInWithMagicLink,
      isInFrame: true,
      farcasterUser: null,
      authenticateWithQuickAuth: mockQuickAuth,
      authenticateWithSIWF: mockSignInWithFarcaster,
      quickAuth: mockQuickAuth,
      signInWithFarcaster: mockSignInWithFarcaster,
      isInFarcasterFrame: true
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Quick Auth with Farcaster')).toBeInTheDocument()
  })

  it('handles Farcaster Quick Auth flow', async () => {
    ;(useFarcasterAuth as vi.Mock).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMagicLink: mockSignInWithMagicLink,
      isInFrame: true,
      farcasterUser: null,
      authenticateWithQuickAuth: mockQuickAuth,
      authenticateWithSIWF: mockSignInWithFarcaster,
      quickAuth: mockQuickAuth,
      signInWithFarcaster: mockSignInWithFarcaster,
      isInFarcasterFrame: true
    })
    mockQuickAuth.mockResolvedValue(undefined)

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    const quickAuthButton = screen.getByText('Quick Auth with Farcaster')
    await userEvent.click(quickAuthButton)

    await waitFor(() => {
      expect(mockQuickAuth).toHaveBeenCalled()
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles Farcaster SIWF flow', async () => {
    mockSignInWithFarcaster.mockResolvedValue(undefined)

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    const siwfButton = screen.getByText('Sign in with Farcaster')
    await userEvent.click(siwfButton)

    await waitFor(() => {
      expect(mockSignInWithFarcaster).toHaveBeenCalled()
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!')
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('shows error message on Farcaster auth failure', async () => {
    const errorMessage = 'Authentication failed'
    mockSignInWithFarcaster.mockRejectedValue(new Error(errorMessage))

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    const siwfButton = screen.getByText('Sign in with Farcaster')
    await userEvent.click(siwfButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(errorMessage)
    })
  })

  it('switches between auth modes correctly', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Initially in sign in mode
    expect(screen.getByText('Sign In')).toBeInTheDocument()

    // Switch to sign up
    fireEvent.click(screen.getByText('Sign up'))
    expect(screen.getByText('Sign Up')).toBeInTheDocument()

    // Switch to magic link
    fireEvent.click(screen.getByText('Sign in'))
    fireEvent.click(screen.getByText('Sign in with magic link'))
    expect(screen.getByText('Magic Link Sign In')).toBeInTheDocument()
  })

  it('shows loading state during Farcaster auth', () => {
    ;(useFarcasterAuth as vi.Mock).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMagicLink: mockSignInWithMagicLink,
      isInFrame: false,
      farcasterUser: null,
      authenticateWithQuickAuth: mockQuickAuth,
      authenticateWithSIWF: mockSignInWithFarcaster,
      quickAuth: mockQuickAuth,
      signInWithFarcaster: mockSignInWithFarcaster,
      isInFarcasterFrame: false
    })

    render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    const farcasterButton = screen.getByText('Authenticating...')
    expect(farcasterButton).toBeDisabled()
  })

  it('resets form when modal closes', () => {
    const { rerender } = render(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Type in email field
    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput).toHaveValue('test@example.com')

    // Close and reopen modal
    rerender(<AuthModal isOpen={false} onClose={mockOnClose} />)
    rerender(<AuthModal isOpen={true} onClose={mockOnClose} />)

    // Email should be reset
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })
})