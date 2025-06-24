import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserMenu } from './UserMenu'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockUseRouter = vi.mocked(useRouter)

describe('UserMenu', () => {
  const mockSignOut = vi.fn()
  const mockPush = vi.fn()
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    user_metadata: {
      avatar_url: 'https://example.com/avatar.jpg',
      full_name: 'Test User',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser as User,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    })
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      forward: vi.fn(),
    })
  })

  it('renders user avatar trigger button', () => {
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-label', 'User menu')
  })

  it('shows user avatar when available', () => {
    render(<UserMenu />)
    
    const avatar = screen.getByAltText('User avatar')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('shows fallback avatar when no avatar URL', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, user_metadata: {} } as User,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: mockSignOut,
    })

    render(<UserMenu />)
    
    const fallbackAvatar = screen.getByTestId('avatar-fallback')
    expect(fallbackAvatar).toHaveTextContent('T') // First letter of email
  })

  it('opens dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('My Posts')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('displays user email in dropdown', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('navigates to my posts when clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    const myPostsButton = screen.getByText('My Posts')
    await user.click(myPostsButton)
    
    expect(mockPush).toHaveBeenCalledWith('/my-post')
  })

  it('calls signOut when sign out is clicked', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <UserMenu />
        <button>Outside button</button>
      </div>
    )
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    const outsideButton = screen.getByText('Outside button')
    await user.click(outsideButton)
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('closes dropdown when escape key is pressed', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    expect(screen.getByRole('menu')).toBeInTheDocument()
    
    await user.keyboard('{Escape}')
    
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('handles sign out error gracefully', async () => {
    const user = userEvent.setup()
    mockSignOut.mockRejectedValueOnce(new Error('Sign out failed'))
    
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    await user.click(trigger)
    
    const signOutButton = screen.getByText('Sign Out')
    await user.click(signOutButton)
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  it('renders with proper accessibility attributes', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    const trigger = screen.getByTestId('user-menu-trigger')
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    
    await user.click(trigger)
    
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    
    const menu = screen.getByRole('menu')
    expect(menu).toHaveAttribute('aria-label', 'User menu')
  })

  it('does not render when user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    const { container } = render(<UserMenu />)
    expect(container.firstChild).toBeNull()
  })
})