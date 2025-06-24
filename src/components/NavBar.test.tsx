import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavBar } from './NavBar'
import { useAuth } from '@/contexts/AuthContext'
import type { User, Session } from '@supabase/supabase-js'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)

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
})