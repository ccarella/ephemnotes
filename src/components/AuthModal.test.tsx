import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthModal } from './AuthModal'
import { useAuth } from '@/contexts/AuthContext'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

describe('AuthModal', () => {
  const mockSignIn = vi.fn()
  const mockSignUp = vi.fn()
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
      signOut: vi.fn(),
    })
  })

  it('renders sign in form by default', () => {
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to sign up form when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const switchLink = screen.getByText(/don't have an account/i)
    await user.click(switchLink)
    
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('calls signIn with correct credentials', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('calls signUp with correct credentials', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    // Switch to sign up mode
    await user.click(screen.getByText(/don't have an account/i))
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'newpassword123')
    await user.click(submitButton)
    
    expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'newpassword123')
  })

  it('displays error message when auth fails', () => {
    const error = new Error('Invalid credentials')
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: error as any,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
    })
    
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('disables form and shows loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signUp: mockSignUp,
      signOut: vi.fn(),
    })
    
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
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

  it('closes modal on successful authentication', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce(undefined)
    
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('does not render when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} onClose={onClose} />)
    expect(container.firstChild).toBeNull()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockSignIn).not.toHaveBeenCalled()
    expect(screen.getByText('Please enter a valid email')).toBeInTheDocument()
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)
    
    expect(mockSignIn).not.toHaveBeenCalled()
    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
  })
})