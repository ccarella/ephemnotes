import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignInPage, { metadata } from './page'

// Mock the SignInForm component
vi.mock('@/components/SignInForm', () => ({
  SignInForm: () => <div data-testid="signin-form">SignIn Form Component</div>,
}))

describe('SignInPage', () => {
  describe('Page Structure', () => {
    it('should render the sign-in page with correct heading', () => {
      render(<SignInPage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Sign In')
    })

    it('should render the page description', () => {
      render(<SignInPage />)

      expect(
        screen.getByText('Enter your email address and we\'ll send you a magic link to sign in instantly. No password required.')
      ).toBeInTheDocument()
    })

    it('should render the SignInForm component', () => {
      render(<SignInPage />)

      expect(screen.getByTestId('signin-form')).toBeInTheDocument()
    })

    it('should render the magic link expiration notice', () => {
      render(<SignInPage />)

      expect(
        screen.getByText('The magic link will expire in 1 hour for security.')
      ).toBeInTheDocument()
    })

    it('should have proper semantic structure', () => {
      render(<SignInPage />)

      // Page uses div structure instead of main element
      const container = screen.getByRole('heading', { level: 1 }).closest('.min-h-screen')
      expect(container).toBeInTheDocument()

      // Heading should come before the form
      const heading = screen.getByRole('heading', { level: 1 })
      const form = screen.getByTestId('signin-form')
      
      expect(heading.compareDocumentPosition(form)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })

    it('should render content in proper order', () => {
      render(<SignInPage />)

      // Verify order by checking that heading appears before description
      const heading = screen.getByRole('heading', { level: 1 })
      const description = screen.getByText(
        'Enter your email address and we\'ll send you a magic link to sign in instantly. No password required.'
      )

      expect(heading.compareDocumentPosition(description)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    })
  })

  describe('Page Metadata', () => {
    it('should have correct title metadata', () => {
      expect(metadata.title).toBe('Sign In - EphemNotes')
    })

    it('should have correct description metadata', () => {
      expect(metadata.description).toBe(
        'Sign in to your EphemNotes account using magic link authentication. No password required.'
      )
    })

    it('should export metadata object', () => {
      expect(metadata).toBeDefined()
      expect(typeof metadata).toBe('object')
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive spacing classes', () => {
      render(<SignInPage />)

      const container = screen.getByRole('heading', { level: 1 }).closest('.space-y-8')
      expect(container).toHaveClass('space-y-8')
    })

    it('should center content properly', () => {
      render(<SignInPage />)

      // Check that the container has text-center class (which centers children)
      const container = screen.getByRole('heading', { level: 1 }).parentElement
      expect(container).toHaveClass('text-center')
    })

    it('should use appropriate typography classes', () => {
      render(<SignInPage />)

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-foreground')

      const description = screen.getByText(
        'Enter your email address and we\'ll send you a magic link to sign in instantly. No password required.'
      )
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<SignInPage />)

      const headings = screen.getAllByRole('heading')
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveProperty('tagName', 'H1')
    })

    it('should have descriptive text for screen readers', () => {
      render(<SignInPage />)

      // Ensure important text is not hidden from screen readers
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).not.toHaveAttribute('aria-hidden')

      const description = screen.getByText(
        'Enter your email address and we\'ll send you a magic link to sign in instantly. No password required.'
      )
      expect(description).not.toHaveAttribute('aria-hidden')
    })

    it('should have logical tab order', () => {
      render(<SignInPage />)

      // All interactive elements should be reachable via keyboard
      const form = screen.getByTestId('signin-form')
      expect(form).not.toHaveAttribute('tabindex', '-1')
    })

    it('should provide context for the sign-in process', () => {
      render(<SignInPage />)

      // Verify that the page provides clear context about what will happen
      expect(
        screen.getAllByText(/magic link/i)
      ).toHaveLength(2)
    })
  })

  describe('Layout Integration', () => {
    it('should work within the auth layout structure', () => {
      render(<SignInPage />)

      // The page defines its own full-height container
      const container = screen.getByRole('heading', { level: 1 }).closest('.min-h-screen')
      expect(container).toHaveClass('min-h-screen')
    })

    it('should use consistent spacing with auth layout', () => {
      render(<SignInPage />)

      const container = screen.getByRole('heading', { level: 1 }).closest('.space-y-8')
      // Should use vertical spacing and includes horizontal padding
      expect(container).toHaveClass('space-y-8')
      
      // Check that the outer container has responsive padding
      const outerContainer = screen.getByRole('heading', { level: 1 }).closest('.min-h-screen')
      expect(outerContainer).toHaveClass('px-4')
    })
  })

  describe('Error Boundaries', () => {
    it('should render without crashing', () => {
      expect(() => render(<SignInPage />)).not.toThrow()
    })

    it('should handle missing SignInForm gracefully', () => {
      // Even if SignInForm is mocked, the page should render
      render(<SignInPage />)
      
      const container = screen.getByRole('heading', { level: 1 }).closest('.min-h-screen')
      expect(container).toBeInTheDocument()
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })

  describe('Content Consistency', () => {
    it('should use consistent terminology', () => {
      render(<SignInPage />)

      // Should use "Sign In" consistently (not "Login" or "Log In")
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Sign In')
      expect(heading).not.toHaveTextContent(/log\s?in/i)
    })

    it('should explain the authentication method clearly', () => {
      render(<SignInPage />)

      // Should mention "magic link" to set user expectations
      expect(screen.getAllByText(/magic link/i)).toHaveLength(2)
      
      // Should mention email as the authentication method
      expect(screen.getByText(/email/i)).toBeInTheDocument()
    })
  })

  describe('Styling Classes', () => {
    it('should apply dark mode compatible text colors', () => {
      render(<SignInPage />)

      const description = screen.getByText(
        'Enter your email address and we\'ll send you a magic link to sign in instantly. No password required.'
      )
      
      // Should use semantic color classes that work in both light and dark mode
      expect(description).toHaveClass('text-muted-foreground')
    })

    it('should have proper text alignment', () => {
      render(<SignInPage />)

      // Container should center-align its children
      const heading = screen.getByRole('heading', { level: 1 })
      const container = heading.parentElement

      expect(container).toHaveClass('text-center')
    })
  })

  describe('SEO Considerations', () => {
    it('should have SEO-friendly metadata', () => {
      // Verify metadata exports exist and have proper values
      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('description')
      
      // Title should be concise and descriptive
      expect(metadata.title).toMatch(/sign\s?in/i)
      
      // Description should mention the app name and purpose
      expect(metadata.description).toMatch(/ephemnotes/i)
      expect(metadata.description).toMatch(/sign\s?in/i)
    })

    it('should have semantic HTML structure for SEO', () => {
      render(<SignInPage />)

      // Should have exactly one h1 tag
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      expect(h1Elements).toHaveLength(1)

      // Content should be properly structured with div elements
      const container = screen.getByRole('heading', { level: 1 }).closest('.min-h-screen')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Integration with SignInForm', () => {
    it('should pass through to SignInForm component', () => {
      render(<SignInPage />)

      // SignInForm should be rendered (mocked in this test)
      expect(screen.getByTestId('signin-form')).toBeInTheDocument()
    })

    it('should not duplicate form functionality', () => {
      render(<SignInPage />)

      // The page itself should not contain form elements
      // All form functionality should be in SignInForm component
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('User Experience', () => {
    it('should provide clear instructions', () => {
      render(<SignInPage />)

      // User should understand what will happen
      const description = screen.getByText(
        /Enter your email address and we'll send you a magic link to sign in instantly/i
      )
      expect(description).toBeInTheDocument()
    })

    it('should set appropriate user expectations', () => {
      render(<SignInPage />)

      // Should mention "magic link" so users know to check email
      expect(screen.getAllByText(/magic link/i)).toHaveLength(2)
      
      // Should mention email
      expect(screen.getByText(/email/i)).toBeInTheDocument()
    })
  })
})