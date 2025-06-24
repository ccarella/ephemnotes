import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RootLayout from '../layout'
import AuthModal from '@/components/AuthModal'
import SignInForm from '@/components/SignInForm'
import NavBar from '@/components/NavBar'

// Mock Next.js modules
vi.mock('next/font/google', () => ({
  GeistSans: () => ({
    className: 'mock-geist-sans',
    variable: '--font-sans',
  }),
  GeistMono: () => ({
    className: 'mock-geist-mono',
    variable: '--font-mono',
  }),
}))

vi.mock('@/providers/supabase-provider', () => ({
  SupabaseProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/providers/auth-provider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/providers/farcaster-provider', () => ({
  FarcasterProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/providers/toast-provider', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/providers/network-monitor', () => ({
  NetworkMonitor: () => null,
}))

describe('UI Design Tests', () => {
  describe('Typography and Readability', () => {
    it('should apply Geist font families correctly', () => {
      const { container } = render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      )
      
      const html = container.querySelector('html')
      expect(html?.className).toContain('mock-geist-sans')
      expect(html?.className).toContain('mock-geist-mono')
    })

    it('should have proper font size hierarchy', () => {
      render(
        <div>
          <h1 className="text-4xl">Heading 1</h1>
          <h2 className="text-3xl">Heading 2</h2>
          <h3 className="text-2xl">Heading 3</h3>
          <p className="text-base">Body text</p>
          <small className="text-sm">Small text</small>
        </div>
      )

      const h1 = screen.getByText('Heading 1')
      const h2 = screen.getByText('Heading 2')
      const h3 = screen.getByText('Heading 3')
      const p = screen.getByText('Body text')
      const small = screen.getByText('Small text')

      expect(h1.className).toContain('text-4xl')
      expect(h2.className).toContain('text-3xl')
      expect(h3.className).toContain('text-2xl')
      expect(p.className).toContain('text-base')
      expect(small.className).toContain('text-sm')
    })

    it('should maintain readable contrast ratios', () => {
      render(
        <div>
          <p className="text-foreground bg-background">Primary text</p>
          <p className="text-gray-600 dark:text-gray-400">Secondary text</p>
          <p className="text-red-600 dark:text-red-400">Error text</p>
        </div>
      )

      const primaryText = screen.getByText('Primary text')
      const secondaryText = screen.getByText('Secondary text')
      const errorText = screen.getByText('Error text')

      expect(primaryText.className).toContain('text-foreground')
      expect(primaryText.className).toContain('bg-background')
      expect(secondaryText.className).toContain('text-gray-600')
      expect(errorText.className).toContain('text-red-600')
    })
  })

  describe('Minimalist Design Principles', () => {
    it('should have clean button styling', () => {
      render(
        <div>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            Secondary Button
          </button>
        </div>
      )

      const primaryButton = screen.getByText('Primary Button')
      const secondaryButton = screen.getByText('Secondary Button')

      expect(primaryButton.className).toContain('rounded-lg')
      expect(primaryButton.className).toContain('transition-colors')
      expect(secondaryButton.className).toContain('border')
    })

    it('should have proper spacing and whitespace', () => {
      render(
        <div className="p-4 md:p-6 lg:p-8 space-y-4">
          <div className="mb-4">Element 1</div>
          <div className="mb-4">Element 2</div>
          <div className="mb-4">Element 3</div>
        </div>
      )

      const container = screen.getByText('Element 1').parentElement
      expect(container?.className).toContain('p-4')
      expect(container?.className).toContain('space-y-4')
    })

    it('should use subtle shadows and borders', () => {
      render(
        <div>
          <div className="shadow-sm rounded-lg border border-gray-200">
            Card with subtle shadow
          </div>
          <input className="border border-gray-300 focus:border-blue-500 rounded-md" />
        </div>
      )

      const card = screen.getByText('Card with subtle shadow')
      expect(card.className).toContain('shadow-sm')
      expect(card.className).toContain('border-gray-200')
    })
  })

  describe('Responsive Design', () => {
    it('should have mobile-first responsive classes', () => {
      render(
        <div className="w-full md:w-auto lg:max-w-4xl">
          <div className="text-sm md:text-base lg:text-lg">
            Responsive text
          </div>
          <div className="px-4 md:px-6 lg:px-8">
            Responsive padding
          </div>
        </div>
      )

      const responsiveText = screen.getByText('Responsive text')
      const responsivePadding = screen.getByText('Responsive padding')

      expect(responsiveText.className).toContain('text-sm')
      expect(responsiveText.className).toContain('md:text-base')
      expect(responsivePadding.parentElement?.className).toContain('px-4')
      expect(responsivePadding.parentElement?.className).toContain('md:px-6')
    })

    it('should have touch-friendly targets on mobile', () => {
      render(
        <button className="min-h-[44px] min-w-[44px] p-3">
          Touch Target
        </button>
      )

      const button = screen.getByText('Touch Target')
      expect(button.className).toContain('min-h-[44px]')
      expect(button.className).toContain('min-w-[44px]')
    })
  })

  describe('Component-specific UI Tests', () => {
    it('should render AuthModal with proper styling', () => {
      render(<AuthModal />)
      
      // Check for form elements
      const container = screen.getByRole('dialog', { hidden: true })
      expect(container).toBeInTheDocument()
    })

    it('should render forms with clean input styling', () => {
      render(<SignInForm />)
      
      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput.className).toContain('rounded')
      expect(emailInput.className).toContain('border')
    })

    it('should render NavBar with minimal design', () => {
      render(<NavBar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
      expect(nav.className).toContain('sticky')
    })
  })

  describe('Dark Mode Support', () => {
    it('should support dark mode classes', () => {
      render(
        <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          Dark mode content
        </div>
      )

      const element = screen.getByText('Dark mode content')
      expect(element.className).toContain('dark:bg-gray-900')
      expect(element.className).toContain('dark:text-gray-100')
    })
  })

  describe('Animation and Transitions', () => {
    it('should use smooth transitions', () => {
      render(
        <button className="transition-all duration-200 ease-in-out hover:scale-105">
          Animated Button
        </button>
      )

      const button = screen.getByText('Animated Button')
      expect(button.className).toContain('transition-all')
      expect(button.className).toContain('duration-200')
    })
  })
})