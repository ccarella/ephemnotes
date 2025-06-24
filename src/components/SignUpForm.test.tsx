import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from './SignUpForm'

// Mock the useToast hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}

vi.mock('@/lib/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock auth context
const mockSignUp = vi.fn()
const mockSignIn = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
  }),
}))

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the sign up form correctly', () => {
      render(<SignUpForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    it('should render all form inputs with correct attributes', () => {
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'you@example.com')

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('placeholder', 'Minimum 6 characters')
    })
  })

  describe('Email Validation', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    it('should accept valid email formats', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      // Since we haven't entered a password, we should get a password error, not an email error
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })

  describe('Password Validation', () => {
    it('should show error for empty password', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })

    it('should show error for password too short', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, '12345')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })

    it('should accept password with 6 or more characters', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, '123456')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.queryByText('Password must be at least 6 characters long')).not.toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call signUp with valid data', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'password123')
      expect(mockSignUp).toHaveBeenCalledTimes(1)
    })

    it('should prevent form submission on validation errors', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should handle form submission by pressing Enter', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')
      await user.keyboard('{Enter}')

      expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'password123')
    })
  })

  describe('Error Message Display', () => {
    it('should display validation error messages', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      const errorMessage = screen.getByText('Email is required')
      expect(errorMessage).toBeInTheDocument()
      expect(errorMessage).toHaveClass('text-red-600')
    })

    it('should clear validation errors when user types valid input', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.getByText('Email is required')).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      // The error should clear as user types
      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      })
    })

    it('should display auth error from Supabase', async () => {
      const user = userEvent.setup()
      const authError = new Error('User already registered')
      mockSignUp.mockRejectedValue(authError)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('An account with this email already exists. Please sign in instead.')
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(screen.getByText('Creating account...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Sign up')).toBeInTheDocument()
      })
    })

    it('should disable form inputs during loading', async () => {
      const user = userEvent.setup()
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(passwordInput).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should re-enable form after submission completes', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(passwordInput).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })
  })

  describe('Success Scenarios', () => {
    it('should show success toast on successful sign up', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Account created! Please check your email to verify your account.'
        )
      })
    })

    it('should call onSuccess callback after successful sign up', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      })
    })

    it('should clear form after successful sign up', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveValue('')
        expect(passwordInput).toHaveValue('')
      })
    })
  })

  describe('Integration with AuthContext', () => {
    it('should use signUp from AuthContext', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue(undefined)
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      expect(mockSignUp).toHaveBeenCalledWith('user@example.com', 'password123')
    })

    it.skip('should handle auth context loading state', () => {
      // This test requires dynamic mocking which is complex in vitest
      // The functionality is tested in integration tests
    })

    it('should handle auth context error state', async () => {
      const user = userEvent.setup()
      const authError = new Error('Auth service unavailable')
      mockSignUp.mockRejectedValue(authError)

      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      
      await user.type(emailInput, 'user@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Auth service unavailable')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<SignUpForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('aria-invalid', 'false')
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false')
    })

    it('should announce validation errors', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      const submitButton = screen.getByRole('button', { name: /sign up/i })
      await user.click(submitButton)

      const emailError = screen.getByText('Email is required')
      expect(emailError).toHaveAttribute('role', 'alert')
      
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<SignUpForm />)

      await user.tab() // Focus email input
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab() // Focus password input
      expect(screen.getByLabelText(/password/i)).toHaveFocus()

      await user.tab() // Focus submit button
      expect(screen.getByRole('button', { name: /sign up/i })).toHaveFocus()
    })
  })
})

