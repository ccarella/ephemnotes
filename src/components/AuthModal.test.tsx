import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from './AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/lib/toast'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  useToast: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockUseToast = vi.mocked(useToast)

describe('AuthModal', () => {
  const mockSignIn = vi.fn()
  const mockSignUp = vi.fn()
  const mockSignInWithMagicLink = vi.fn()
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
  }
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithMagicLink: mockSignInWithMagicLink,
      signOut: vi.fn(),
    })
    mockUseToast.mockReturnValue({
      toasts: [],
      toast: mockToast,
    })
  })

  it('renders sign in form by default', () => {
    render(<AuthModal isOpen={true} onClose={onClose} />)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with magic link/i })).toBeInTheDocument()
  })

  it('switches to sign up form when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    const switchButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(switchButton)

    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('calls signIn with correct credentials', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('calls signUp with correct credentials', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    // Switch to sign up mode
    const switchButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(switchButton)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'newpassword123')
    await user.click(submitButton)

    expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'newpassword123')
  })

  it('displays error toast when auth fails', async () => {
    const user = userEvent.setup()
    const error = new Error('Invalid credentials')
    mockSignIn.mockRejectedValueOnce(error)

    render(<AuthModal isOpen={true} onClose={onClose} />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  it('disables form and shows loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signInWithMagicLink: mockSignInWithMagicLink,
      signOut: vi.fn(),
    })

    render(<AuthModal isOpen={true} onClose={onClose} />)

    const submitButton = screen.getByRole('button', { name: /loading/i })
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('closes modal and shows success toast on successful sign in', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce(undefined)

    render(<AuthModal isOpen={true} onClose={onClose} />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!')
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('closes modal and shows success toast on successful sign up', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce(undefined)

    render(<AuthModal isOpen={true} onClose={onClose} />)

    // Switch to sign up mode
    const switchButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(switchButton)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'newpassword123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        'Account created! Please check your email to verify your account.'
      )
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={onClose} />)
    expect(container.firstChild).toBeNull()
  })

  it('validates email format and shows inline error', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
    })

    expect(mockSignIn).not.toHaveBeenCalled()
    expect(mockToast.error).not.toHaveBeenCalled()
  })

  it('validates password length and shows inline error', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })

    expect(mockSignIn).not.toHaveBeenCalled()
    expect(mockToast.error).not.toHaveBeenCalled()
  })

  it('switches to magic link mode and sends magic link', async () => {
    const user = userEvent.setup()
    mockSignInWithMagicLink.mockResolvedValueOnce(undefined)

    render(<AuthModal isOpen={true} onClose={onClose} />)

    // Click on magic link button
    const magicLinkButton = screen.getByRole('button', { name: /sign in with magic link/i })
    await user.click(magicLinkButton)

    // Should show magic link form
    expect(screen.getByRole('heading', { name: 'Magic Link Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()

    // Enter email and submit
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Send Magic Link' })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('test@example.com')
    })

    // Should show success message
    expect(screen.getByText('Check your email!')).toBeInTheDocument()
    expect(screen.getByText(/We've sent a magic link to/)).toBeInTheDocument()
  })
})

