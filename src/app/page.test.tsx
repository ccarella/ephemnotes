import { render, screen, waitFor } from '@/test/test-utils'
import { vi } from 'vitest'
import Home from './page'

// Mock Next.js server functions
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Mock the PostFeed component to avoid async server component issues
vi.mock('@/components/PostFeed', () => ({
  PostFeed: ({ isLoading }: { isLoading: boolean }) => {
    if (isLoading) {
      return (
        <div>
          <div data-testid="post-item-skeleton">Loading...</div>
          <div data-testid="post-item-skeleton">Loading...</div>
          <div data-testid="post-item-skeleton">Loading...</div>
        </div>
      )
    }
    return <div>Posts loaded</div>
  },
}))

// Mock Supabase server client
vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  }),
}))

// Mock posts lib
vi.mock('@/lib/posts', () => ({
  getPosts: vi.fn().mockResolvedValue([]),
}))

describe('Home Page', () => {
  it('renders the home page structure', async () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'EphemNotes' })).toBeInTheDocument()
    expect(screen.getByText('Share your ephemeral thoughts')).toBeInTheDocument()
    expect(screen.getByText('Recent Posts')).toBeInTheDocument()
    
    // Wait for the suspense to resolve
    await waitFor(() => {
      expect(screen.getByText('Posts loaded')).toBeInTheDocument()
    })
  })

  it('renders navigation bar', async () => {
    render(<Home />)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    
    // Wait for the suspense to resolve
    await waitFor(() => {
      expect(screen.getByText('Posts loaded')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', async () => {
    render(<Home />)
    
    const skeletons = screen.getAllByTestId('post-item-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
    
    // Wait for the suspense to resolve
    await waitFor(() => {
      expect(screen.getByText('Posts loaded')).toBeInTheDocument()
    })
  })
})
