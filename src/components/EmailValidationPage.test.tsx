import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmailValidationPage } from './EmailValidationPage'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

describe('EmailValidationPage', () => {
  describe('Component Rendering', () => {
    it('should render the email validation page with proper structure', () => {
      render(<EmailValidationPage />)

      // Check for main heading
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent(/check your email/i)
    })

    it('should display the page title and description', () => {
      render(<EmailValidationPage />)

      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      expect(screen.getByText(/we've sent a verification email/i)).toBeInTheDocument()
    })

    it('should have proper semantic HTML structure', () => {
      const { container } = render(<EmailValidationPage />)

      // Check for main element
      const main = container.querySelector('main')
      expect(main).toBeInTheDocument()

      // Check for proper heading hierarchy
      const h1 = container.querySelector('h1')
      expect(h1).toBeInTheDocument()
    })
  })

  describe('Email Validation Instructions', () => {
    it('should display clear instructions about checking email', () => {
      render(<EmailValidationPage />)

      // Check for instruction text
      expect(screen.getByText(/please check your inbox/i)).toBeInTheDocument()
      expect(screen.getByText(/click the verification link/i)).toBeInTheDocument()
    })

    it('should mention checking spam folder', () => {
      render(<EmailValidationPage />)

      expect(screen.getByText(/don't see the email\?/i)).toBeInTheDocument()
      expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument()
    })

    it('should display the email address if provided', () => {
      const testEmail = 'user@example.com'
      render(<EmailValidationPage email={testEmail} />)

      expect(screen.getByText(testEmail)).toBeInTheDocument()
    })
  })

  describe('Resend Verification Email', () => {
    it('should display a resend verification email button', () => {
      render(<EmailValidationPage />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      expect(resendButton).toBeInTheDocument()
    })

    it('should handle resend email click', async () => {
      const user = userEvent.setup()
      const onResend = vi.fn()

      render(<EmailValidationPage onResend={onResend} />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      await user.click(resendButton)

      expect(onResend).toHaveBeenCalledTimes(1)
    })

    it('should show loading state when resending email', async () => {
      const user = userEvent.setup()
      const onResend = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

      render(<EmailValidationPage onResend={onResend} />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      await user.click(resendButton)

      // Check for loading state - button text changes to "Sending..."
      expect(resendButton).toHaveTextContent('Sending...')
      expect(resendButton).toBeDisabled()
    })

    it('should show success message after resending email', async () => {
      const user = userEvent.setup()
      const onResend = vi.fn().mockResolvedValue(true)

      render(<EmailValidationPage onResend={onResend} />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      await user.click(resendButton)

      // Wait for success message
      expect(await screen.findByText(/email sent successfully/i)).toBeInTheDocument()
    })

    it('should show error message if resend fails', async () => {
      const user = userEvent.setup()
      const onResend = vi.fn().mockRejectedValue(new Error('Failed to send'))

      render(<EmailValidationPage onResend={onResend} />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      await user.click(resendButton)

      // Wait for error message
      expect(await screen.findByText(/failed to send email/i)).toBeInTheDocument()
    })

    it('should disable resend button for cooldown period after sending', async () => {
      const user = userEvent.setup()
      const onResend = vi.fn().mockResolvedValue(true)

      render(<EmailValidationPage onResend={onResend} />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      await user.click(resendButton)

      // Button should be disabled after sending
      expect(await screen.findByText(/email sent successfully/i)).toBeInTheDocument()
      expect(resendButton).toBeDisabled()

      // Should show cooldown timer
      expect(screen.getByText(/resend in \d+ seconds/i)).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should display a link to go back to login', () => {
      render(<EmailValidationPage />)

      const loginLink = screen.getByRole('link', { name: /back to login/i })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })

    it('should display a link to contact support', () => {
      render(<EmailValidationPage />)

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      expect(supportLink).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive container classes', () => {
      const { container } = render(<EmailValidationPage />)

      const mainContainer = container.querySelector('main')
      expect(mainContainer).toHaveClass('container')
      expect(mainContainer).toHaveClass('mx-auto')
      expect(mainContainer).toHaveClass('px-4')
    })

    it('should have mobile-friendly padding and spacing', () => {
      const { container } = render(<EmailValidationPage />)

      // Check for responsive padding classes
      const contentDiv = container.querySelector('.max-w-md')
      expect(contentDiv).toBeInTheDocument()

      // Check for responsive spacing
      const elements = container.querySelectorAll('[class*="py-"], [class*="px-"]')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('should center content on larger screens', () => {
      const { container } = render(<EmailValidationPage />)

      // Check for centering classes
      expect(container.querySelector('.mx-auto')).toBeInTheDocument()
      expect(container.querySelector('.text-center')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      render(<EmailValidationPage />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      expect(resendButton).toHaveAccessibleName()

      const loginLink = screen.getByRole('link', { name: /back to login/i })
      expect(loginLink).toHaveAccessibleName()
    })

    it('should have proper heading hierarchy', () => {
      const { container } = render(<EmailValidationPage />)

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      const headingLevels = Array.from(headings).map((h) => parseInt(h.tagName[1]))

      // Check that heading levels don't skip
      for (let i = 1; i < headingLevels.length; i++) {
        expect(headingLevels[i] - headingLevels[i - 1]).toBeLessThanOrEqual(1)
      }
    })

    it('should have descriptive text for screen readers', () => {
      render(<EmailValidationPage />)

      // Check for visually hidden text for screen readers
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument()
    })

    it('should announce status changes to screen readers', async () => {
      const user = userEvent.setup()
      const onResend = vi.fn().mockResolvedValue(true)

      const { container } = render(<EmailValidationPage onResend={onResend} />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })
      await user.click(resendButton)

      // Check for ARIA live region
      const liveRegion = container.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeInTheDocument()
      expect(await screen.findByText(/email sent successfully/i)).toBeInTheDocument()
    })

    it('should have proper focus management', async () => {
      const user = userEvent.setup()
      render(<EmailValidationPage />)

      // Tab through interactive elements
      await user.tab()
      expect(screen.getByRole('button', { name: /resend verification email/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('link', { name: /back to login/i })).toHaveFocus()

      await user.tab()
      expect(screen.getByRole('link', { name: /contact support/i })).toHaveFocus()
    })

    it('should have sufficient color contrast', () => {
      const { container } = render(<EmailValidationPage />)

      // Check that text elements have appropriate classes for contrast
      const textElements = container.querySelectorAll('p, h1')
      const hasColorClasses = Array.from(textElements).some((element) => {
        const classes = element.className
        return /text-(gray|black|white|neutral|blue|red|green)-\d+/.test(classes)
      })

      expect(hasColorClasses).toBe(true)

      // Check specific elements have color classes
      expect(container.querySelector('h1')?.className).toContain('text-gray-900')
      expect(container.querySelector('.text-gray-600')).toBeTruthy()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing email prop gracefully', () => {
      render(<EmailValidationPage />)

      // Should still render without email
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      // Should show generic message instead of specific email
      expect(screen.queryByText(/user@example.com/)).not.toBeInTheDocument()
    })

    it('should handle missing onResend callback', async () => {
      const user = userEvent.setup()
      render(<EmailValidationPage />)

      const resendButton = screen.getByRole('button', { name: /resend verification email/i })

      // Should not throw error when clicking without callback
      await expect(user.click(resendButton)).resolves.not.toThrow()
    })

    it('should handle very long email addresses', () => {
      const longEmail =
        'verylongemailaddressthatmightcauselayoutissues@example-with-very-long-domain-name.com'
      render(<EmailValidationPage email={longEmail} />)

      const emailElement = screen.getByText(longEmail)
      expect(emailElement).toBeInTheDocument()
      // Should have word-break styling
      expect(emailElement).toHaveClass('break-words')
    })
  })
})
