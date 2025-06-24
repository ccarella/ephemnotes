import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from './SignInForm'

// Mock the toast function with vi.hoisted
const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

// Mock auth functions with vi.hoisted
const mockSignInWithMagicLink = vi.hoisted(() => vi.fn())
const mockSignIn = vi.hoisted(() => vi.fn())
const mockSignUp = vi.hoisted(() => vi.fn())
const mockSignOut = vi.hoisted(() => vi.fn())

// Mock auth context with signInWithMagicLink
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: mockSignOut,
    signInWithMagicLink: mockSignInWithMagicLink,
  }),
}))

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the sign in form correctly', () => {
      render(<SignInForm />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument()
    })

    it('should render email input with correct attributes', () => {
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    it('should render form with proper accessibility attributes', () => {
      render(<SignInForm />)

      // HTML forms have implicit form role, but we need to query by tag since it might not be exposed
      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    })
  })

  describe('Email Validation', () => {
    it('should show error for empty email', async () => {
      const user = userEvent.setup()
      render(<SignInForm />)

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(mockSignInWithMagicLink).not.toHaveBeenCalled()
    })

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      expect(mockSignInWithMagicLink).not.toHaveBeenCalled()
    })

    it('should validate invalid email formats one by one', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<SignInForm />)
      
      // Test plaintext email
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'plaintext')
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      
      unmount()
    })

    it('should validate emails with missing domain', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@')
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      
      unmount()
    })

    it('should validate emails with spaces', async () => {
      const user = userEvent.setup()
      const { unmount } = render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user name@example.com')
      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      
      unmount()
    })

    it('should accept valid email formats', async () => {
      const user = userEvent.setup()
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        '123@example.com',
      ]

      for (const email of validEmails) {
        mockSignInWithMagicLink.mockResolvedValue(undefined)
        const { unmount } = render(<SignInForm />)

        const emailInput = screen.getByLabelText(/email/i)
        await user.clear(emailInput)
        await user.type(emailInput, email)

        const submitButton = screen.getByRole('button', { name: /send magic link/i })
        await user.click(submitButton)

        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
        expect(mockSignInWithMagicLink).toHaveBeenCalledWith(email)
        
        // Clean up for next iteration
        unmount()
        vi.clearAllMocks()
      }
    })

    it('should clear validation error when user types valid email', async () => {
      const user = userEvent.setup()
      render(<SignInForm />)

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(screen.getByText('Email is required')).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      await waitFor(() => {
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call signInWithMagicLink with email on valid submission', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('user@example.com')
      expect(mockSignInWithMagicLink).toHaveBeenCalledTimes(1)
    })

    it('should handle form submission by pressing Enter', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')
      await user.keyboard('{Enter}')

      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('user@example.com')
    })

    it('should prevent duplicate submissions', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)
      await user.click(submitButton) // Try to click again while loading

      expect(mockSignInWithMagicLink).toHaveBeenCalledTimes(1)
    })

    it('should trim whitespace from email before submission', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, '  user@example.com  ')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('user@example.com')
    })
  })

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(screen.getByText('Sending...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.getByText('Send Magic Link')).toBeInTheDocument()
      })
    })

    it('should disable form inputs during loading', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(emailInput).toBeDisabled()
      expect(submitButton).toBeDisabled()

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should show loading spinner in button', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      const spinner = submitButton.querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')

      await waitFor(() => {
        expect(submitButton.querySelector('svg')).not.toBeInTheDocument()
      })
    })
  })

  describe('Success Scenarios', () => {
    it('should show success message when magic link is sent', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Magic link sent to user@example.com'
        )
      })
    })

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveValue('')
      })
    })

    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm onSuccess={mockOnSuccess} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1)
      })
    })

  })

  describe('Error Handling', () => {
    it('should display error message for network failure', async () => {
      const user = userEvent.setup()
      const networkError = new Error('Network request failed')
      mockSignInWithMagicLink.mockRejectedValue(networkError)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Network request failed'
        )
      })
    })

    it('should handle rate limiting error', async () => {
      const user = userEvent.setup()
      const rateLimitError = new Error('Rate limit exceeded')
      mockSignInWithMagicLink.mockRejectedValue(rateLimitError)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Rate limit exceeded'
        )
      })
    })

    it('should handle invalid email error from server', async () => {
      const user = userEvent.setup()
      const invalidEmailError = new Error('Invalid email address')
      mockSignInWithMagicLink.mockRejectedValue(invalidEmailError)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Invalid email address')
      })
    })

    it('should re-enable form after error', async () => {
      const user = userEvent.setup()
      const error = new Error('Server error')
      mockSignInWithMagicLink.mockRejectedValue(error)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should not clear form on error', async () => {
      const user = userEvent.setup()
      const error = new Error('Server error')
      mockSignInWithMagicLink.mockRejectedValue(error)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveValue('user@example.com')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<SignInForm />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('aria-invalid', 'false')
    })

    it('should announce validation errors', async () => {
      const user = userEvent.setup()
      render(<SignInForm />)

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      const errorMessage = screen.getByText('Email is required')
      expect(errorMessage).toHaveAttribute('role', 'alert')
      expect(errorMessage).toHaveAttribute('aria-live', 'polite')

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<SignInForm />)

      await user.tab() // Focus email input
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab() // Focus submit button
      expect(screen.getByRole('button', { name: /send magic link/i })).toHaveFocus()
    })

    it('should have descriptive button text during loading', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(screen.getByText('Sending...')).toBeInTheDocument()
    })

    it('should support screen reader announcements for success', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Magic link sent to user@example.com'
        )
      })
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes', () => {
      render(<SignInForm />)

      const form = document.querySelector('form')
      expect(form).toHaveClass('space-y-4')

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveClass('w-full')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      expect(submitButton).toHaveClass('w-full')
    })

    it('should maintain proper spacing on different screen sizes', () => {
      render(<SignInForm />)

      const form = document.querySelector('form')
      expect(form).toHaveClass('space-y-4')
    })
  })

  describe('Integration with AuthContext', () => {
    it('should use signInWithMagicLink from AuthContext', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockResolvedValue(undefined)
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(mockSignInWithMagicLink).toHaveBeenCalledWith('user@example.com')
    })

    it('should handle signInWithMagicLink errors gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock signInWithMagicLink to throw an error
      mockSignInWithMagicLink.mockRejectedValue(new Error('Method not available'))
      
      render(<SignInForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Method not available'
        )
      })
    })
  })

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<SignInForm className="custom-class" />)

      const form = document.querySelector('form')
      expect(form).toHaveClass('custom-class', 'space-y-4')
    })

    it('should accept custom button text', () => {
      render(<SignInForm buttonText="Get Magic Link" />)

      expect(screen.getByRole('button', { name: /get magic link/i })).toBeInTheDocument()
    })

    it('should accept custom loading text', async () => {
      const user = userEvent.setup()
      mockSignInWithMagicLink.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      render(<SignInForm loadingText="Processing..." />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user@example.com')

      const submitButton = screen.getByRole('button', { name: /send magic link/i })
      await user.click(submitButton)

      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })
})