import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import PostForm from './PostForm'

const mockRouter = {
  back: vi.fn(),
}

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

vi.mock('@/lib/toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('PostForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<PostForm onSubmit={vi.fn()} />)
    
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Body')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish Post' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('displays initial data when provided', () => {
    const initialData = {
      title: 'Test Title',
      body: 'Test Body',
    }
    
    render(<PostForm initialData={initialData} onSubmit={vi.fn()} />)
    
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Body')).toBeInTheDocument()
  })

  it('shows correct button text when editing', () => {
    render(<PostForm onSubmit={vi.fn()} isEditing />)
    
    expect(screen.getByRole('button', { name: 'Update Post' })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={vi.fn()} />)
    
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    expect(screen.getByText('Body is required')).toBeInTheDocument()
  })

  it('validates title length', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={vi.fn()} />)
    
    const titleInput = screen.getByLabelText('Title')
    // maxLength prevents typing more than 100 chars
    await user.type(titleInput, 'a'.repeat(100))
    
    // Verify exactly 100 chars are entered
    expect(titleInput).toHaveValue('a'.repeat(100))
    expect(screen.getByText('100/100 characters')).toBeInTheDocument()
  })

  it('validates body length', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={vi.fn()} />)
    
    const bodyInput = screen.getByLabelText('Body')
    // First fill with valid text, then add a title to trigger validation on body
    await user.type(bodyInput, 'a'.repeat(1000))
    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'Test')
    
    // The maxLength attribute prevents typing more than 1000 chars
    // So we check that exactly 1000 chars are entered
    expect(bodyInput).toHaveValue('a'.repeat(1000))
    expect(screen.getByText('1000/1000 characters')).toBeInTheDocument()
  })

  it('shows character count', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={vi.fn()} />)
    
    const titleInput = screen.getByLabelText('Title')
    const bodyInput = screen.getByLabelText('Body')
    
    await user.type(titleInput, 'Test')
    await user.type(bodyInput, 'Test body')
    
    expect(screen.getByText('4/100 characters')).toBeInTheDocument()
    expect(screen.getByText('9/1000 characters')).toBeInTheDocument()
  })

  it('submits form with valid data and shows success toast', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()
    render(<PostForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByLabelText('Title'), 'Test Title')
    await user.type(screen.getByLabelText('Body'), 'Test Body Content')
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'Test Title',
      body: 'Test Body Content',
    })
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Post created successfully!')
    })
  })

  it('resets form after successful creation', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()
    render(<PostForm onSubmit={mockSubmit} />)
    
    const titleInput = screen.getByLabelText('Title')
    const bodyInput = screen.getByLabelText('Body')
    
    await user.type(titleInput, 'Test Title')
    await user.type(bodyInput, 'Test Body Content')
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('')
      expect(bodyInput).toHaveValue('')
      expect(screen.getByText('0/100 characters')).toBeInTheDocument()
      expect(screen.getByText('0/1000 characters')).toBeInTheDocument()
    })
  })

  it('trims whitespace from submitted data', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()
    render(<PostForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByLabelText('Title'), '  Test Title  ')
    await user.type(screen.getByLabelText('Body'), '  Test Body  ')
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    
    expect(mockSubmit).toHaveBeenCalledWith({
      title: 'Test Title',
      body: 'Test Body',
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100)))
    render(<PostForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByLabelText('Title'), 'Test')
    await user.type(screen.getByLabelText('Body'), 'Test')
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeDisabled()
    expect(screen.getByLabelText('Body')).toBeDisabled()
  })

  it('shows update success toast when editing', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn()
    render(<PostForm onSubmit={mockSubmit} isEditing />)
    
    await user.type(screen.getByLabelText('Title'), 'Updated Title')
    await user.type(screen.getByLabelText('Body'), 'Updated Body')
    await user.click(screen.getByRole('button', { name: 'Update Post' }))
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Post updated successfully!')
    })
  })

  it('shows error toast on submission failure', async () => {
    const user = userEvent.setup()
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
    render(<PostForm onSubmit={mockSubmit} />)
    
    await user.type(screen.getByLabelText('Title'), 'Test')
    await user.type(screen.getByLabelText('Body'), 'Test')
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Submission failed')
    })
  })

  it('clears validation errors when user types', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={vi.fn()} />)
    
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))
    expect(screen.getByText('Title is required')).toBeInTheDocument()
    
    await user.type(screen.getByLabelText('Title'), 'a')
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
  })

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<PostForm onSubmit={vi.fn()} />)
    
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    
    expect(mockRouter.back).toHaveBeenCalled()
  })
})