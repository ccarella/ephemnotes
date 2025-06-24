import { render, screen } from '@testing-library/react'
import { PostFeed } from './PostFeed'
import { vi } from 'vitest'
import { useRouter } from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  useToast: () => ({
    toast: {
      error: vi.fn(),
    },
  }),
}))

describe('PostFeed', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as AppRouterInstance)
  })

  it('renders loading state', () => {
    render(<PostFeed isLoading />)
    expect(screen.getAllByTestId('post-skeleton')).toHaveLength(3)
  })

  it('renders empty state with correct message', () => {
    render(<PostFeed posts={[]} />)
    expect(screen.getByText('Be the first to post')).toBeInTheDocument()
    expect(screen.getByText('Create Post')).toBeInTheDocument()
  })

  it('renders posts when available', () => {
    const mockPosts = [
      {
        id: '1',
        title: 'Test Post',
        body: 'Test content',
        user_id: 'user-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
    render(<PostFeed posts={mockPosts} />)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })

  it('renders error state for generic errors', () => {
    const error = new Error('Something went wrong')
    render(<PostFeed error={error} />)
    expect(screen.getByText('Unable to Load Posts')).toBeInTheDocument()
    expect(
      screen.getByText('Something went wrong while loading posts. Please try again.')
    ).toBeInTheDocument()
  })

  it('renders error state for network errors', () => {
    const error = new Error('Network request failed')
    render(<PostFeed error={error} />)
    expect(screen.getByText('Connection Error')).toBeInTheDocument()
    expect(screen.getByText('Check your internet connection and try again.')).toBeInTheDocument()
  })

  it('handles table not found error as empty state', () => {
    const error = new Error('relation "public.posts" does not exist')
    render(<PostFeed error={error} />)
    expect(screen.getByText('Be the first to post')).toBeInTheDocument()
    expect(screen.getByText('Create Post')).toBeInTheDocument()
  })

  it('navigates to new post page when Create Post is clicked', () => {
    render(<PostFeed posts={[]} />)
    const createButton = screen.getByText('Create Post')
    createButton.click()
    expect(mockPush).toHaveBeenCalledWith('/new-post')
  })
})
