import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import EditPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const mockPush = vi.fn()

describe('Edit Page', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders the edit page with title', () => {
    render(<EditPage />)

    expect(screen.getByText('Create/Edit Post')).toBeInTheDocument()
    expect(screen.getByText('Share your ephemeral thought')).toBeInTheDocument()
  })

  it('has a textarea for content input', () => {
    render(<EditPage />)

    const textarea = screen.getByLabelText('Your Ephemeral Thought')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('required')
  })

  it('updates content when typing', () => {
    render(<EditPage />)

    const textarea = screen.getByLabelText('Your Ephemeral Thought')
    fireEvent.change(textarea, { target: { value: 'Test content' } })

    expect(textarea).toHaveValue('Test content')
  })

  it('navigates to my-post on cancel', () => {
    render(<EditPage />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockPush).toHaveBeenCalledWith('/my-post')
  })

  it('submits form and navigates to my-post', () => {
    render(<EditPage />)

    const textarea = screen.getByLabelText('Your Ephemeral Thought')
    const submitButton = screen.getByText('Publish Post')

    fireEvent.change(textarea, { target: { value: 'Test post content' } })
    fireEvent.click(submitButton)

    expect(mockPush).toHaveBeenCalledWith('/my-post')
  })
})
