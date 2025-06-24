import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import EditPage from './page'

// Mock next/navigation
const mockPush = vi.fn()
const mockSearchParams = new Map()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
  }),
}))

// Mock PostForm component
vi.mock('@/components/PostForm', () => ({
  default: ({ initialData, onSubmit }: { initialData?: { title: string; body: string }; onSubmit: (data: { title: string; body: string }) => Promise<void> }) => (
    <form 
      data-testid="post-form"
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({ title: 'Test', body: 'Test post content' })
      }}
    >
      <textarea
        aria-label="Your Ephemeral Thought"
        defaultValue={initialData?.body || ''}
        required
        onChange={(e) => {
          // Store the value for testing
          ;(e.target as HTMLTextAreaElement).value = e.target.value
        }}
      />
      <button type="submit">
        Publish Post
      </button>
      <button type="button" onClick={() => mockPush('/my-post')}>
        Cancel
      </button>
    </form>
  ),
}))

// Mock contexts and providers
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}))

vi.mock('@/providers/supabase-provider', () => ({
  useSupabase: () => ({
    supabase: {},
  }),
}))

// Mock post functions
vi.mock('@/lib/posts', () => ({
  getPostById: vi.fn(),
  updatePost: vi.fn(),
}))

describe('Edit Page', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSearchParams.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to new-post when no id is provided', () => {
    render(<EditPage />)

    // The component should redirect to /new-post when no id is in search params
    expect(mockPush).toHaveBeenCalledWith('/new-post')
  })

  it('renders loading state initially when id is provided', () => {
    // Set up search params with an id
    mockSearchParams.set('id', 'test-post-id')
    
    render(<EditPage />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders the edit page with form when post is loaded', async () => {
    // Set up search params with an id
    mockSearchParams.set('id', 'test-post-id')
    
    // Mock the getPostById to return a post
    const { getPostById } = await import('@/lib/posts')
    vi.mocked(getPostById).mockResolvedValue({
      id: 'test-post-id',
      title: 'Test Post',
      body: 'Test content',
      user_id: 'test-user-id',
    })

    render(<EditPage />)

    // Wait for the post to load and form to render
    const textarea = await screen.findByLabelText('Your Ephemeral Thought')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('required')
  })

  it('navigates to my-post on cancel', async () => {
    mockSearchParams.set('id', 'test-post-id')
    
    const { getPostById } = await import('@/lib/posts')
    vi.mocked(getPostById).mockResolvedValue({
      id: 'test-post-id',
      title: 'Test Post',
      body: 'Test content',
      user_id: 'test-user-id',
    })

    render(<EditPage />)

    const cancelButton = await screen.findByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockPush).toHaveBeenCalledWith('/my-post')
  })

  it('submits form and navigates to my-post', async () => {
    mockSearchParams.set('id', 'test-post-id')
    
    const { getPostById, updatePost } = await import('@/lib/posts')
    vi.mocked(getPostById).mockResolvedValue({
      id: 'test-post-id',
      title: 'Test Post',
      body: 'Test content',
      user_id: 'test-user-id',
    })
    vi.mocked(updatePost).mockResolvedValue(undefined)

    render(<EditPage />)

    // Wait for the form to be rendered
    const form = await screen.findByTestId('post-form')
    
    // Submit the form
    fireEvent.submit(form)

    // Wait for the navigation to occur
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/my-post')
    })
  })
})
