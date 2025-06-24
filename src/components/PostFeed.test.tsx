import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostFeed } from './PostFeed'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}))

vi.mock('@/lib/toast', () => ({
  useToast: () => ({
    toast: {
      error: vi.fn()
    }
  })
}))

vi.mock('./DatabaseInitGuide', () => ({
  DatabaseInitGuide: () => <div>Database Not Initialized</div>
}))

describe('PostFeed', () => {
  const mockPush = vi.fn()
  
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>)
  })

  it('renders loading state', () => {
    render(<PostFeed isLoading />)
    expect(screen.getAllByTestId('post-skeleton')).toHaveLength(3)
  })

  it('renders empty state when no posts', () => {
    render(<PostFeed posts={[]} />)
    expect(screen.getByText('Be the first to post')).toBeInTheDocument()
    expect(screen.getByText('Create Post')).toBeInTheDocument()
  })

  it('handles database not initialized error by showing database init guide', () => {
    const dbError = new Error('relation "posts" does not exist')
    render(<PostFeed error={dbError} />)
    
    expect(screen.getByText('Database Not Initialized')).toBeInTheDocument()
  })

  it('shows network error message for network errors', () => {
    const networkError = new Error('Network request failed')
    render(<PostFeed error={networkError} />)
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument()
    expect(screen.getByText('Check your internet connection and try again.')).toBeInTheDocument()
  })

  it('shows generic error message for other errors', () => {
    const genericError = new Error('Something went wrong')
    render(<PostFeed error={genericError} />)
    
    expect(screen.getByText('Unable to Load Posts')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong while loading posts. Please try again.')).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    const error = new Error('Something went wrong')
    render(<PostFeed error={error} onRetry={onRetry} />)
    
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()
  })

  it('renders posts when provided', () => {
    const posts = [
      {
        id: '1',
        user_id: 'user1',
        username: 'testuser',
        title: 'Test Post',
        body: 'Test content',
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    render(<PostFeed posts={posts} />)
    expect(screen.getByText('Test Post')).toBeInTheDocument()
  })
})