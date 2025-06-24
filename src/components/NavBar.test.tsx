import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavBar } from './NavBar'
import { useAuth } from '@/contexts/AuthContext'
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext'
import type { User, Session } from '@supabase/supabase-js'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/contexts/FarcasterAuthContext', () => ({
  useFarcasterAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockUseFarcasterAuth = vi.mocked(useFarcasterAuth)

describe('NavBar', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: {
      avatar_url: 'https://example.com/avatar.jpg',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock for FarcasterAuth
    mockUseFarcasterAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMagicLink: vi.fn(),
      isInFrame: false,
      farcasterUser: null,
      authenticateWithQuickAuth: vi.fn(),
      authenticateWithSIWF: vi.fn(),
    })
  })

  it('renders logo and sign in button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    
    expect(screen.getByText('EphemNotes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders user menu when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser as User,
      session: {} as Session,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    
    expect(screen.getByText('EphemNotes')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('user-menu-trigger')).toBeInTheDocument()
  })

  it('opens auth modal when sign in button is clicked', async () => {
    const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    
    expect(screen.getByTestId('navbar-loading')).toBeInTheDocument()
  })

  it('applies sticky positioning and blur effect', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    const { container } = render(<NavBar />)
    const nav = container.querySelector('nav')
    
    expect(nav).toHaveClass('sticky')
    expect(nav).toHaveClass('top-0')
    expect(nav).toHaveClass('backdrop-blur')
  })

  it('is responsive on mobile', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    const container = screen.getByTestId('navbar-container').parentElement
    
    expect(container).toHaveClass('px-4')
    expect(container).toHaveClass('sm:px-6')
    expect(container).toHaveClass('lg:px-8')
  })

  it('maintains consistent height', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    const container = screen.getByTestId('navbar-container')
    
    expect(container).toHaveClass('h-16')
  })

  it('navigates to home when logo is clicked', async () => {
    // const user = userEvent.setup()
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<NavBar />)
    
    const logo = screen.getByText('EphemNotes')
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  describe('mobile navigation', () => {
    it('shows hamburger menu button on mobile', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      })

      render(<NavBar />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle menu')
      expect(mobileMenuButton).toBeInTheDocument()
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('toggles mobile menu when hamburger button is clicked', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      })

      render(<NavBar />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle menu')
      
      // Initially menu is closed
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByRole('button', { name: /sign in/i })).toBeInTheDocument()
      
      // Open menu
      await user.click(mobileMenuButton)
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
      
      // Close menu
      await user.click(mobileMenuButton)
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('closes mobile menu when sign in is clicked', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      })

      render(<NavBar />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle menu')
      
      // Open menu
      await user.click(mobileMenuButton)
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true')
      
      // Click sign in button in mobile menu
      const signInButtons = screen.getAllByRole('button', { name: /sign in/i })
      const mobileSignInButton = signInButtons[signInButtons.length - 1] // Last one is in mobile menu
      await user.click(mobileSignInButton)
      
      // Menu should be closed and auth modal should be open
      expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false')
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('shows user menu in mobile menu when authenticated', async () => {
      const user = userEvent.setup()
      mockUseAuth.mockReturnValue({
        user: mockUser as User,
        session: {} as Session,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      })

      render(<NavBar />)
      
      const mobileMenuButton = screen.getByLabelText('Toggle menu')
      
      // Open menu
      await user.click(mobileMenuButton)
      
      // Should show UserMenu component in mobile menu
      const userMenus = screen.getAllByTestId('user-menu-trigger')
      expect(userMenus.length).toBeGreaterThan(1) // One in desktop nav, one in mobile menu
    })
  })
})