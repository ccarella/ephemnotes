import { render, screen } from '@/test/test-utils'
import Home from './page'

describe('Home Page', () => {
  it('renders the home page with title', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'EphemNotes' })).toBeInTheDocument()
    expect(screen.getByText('Share your ephemeral thoughts')).toBeInTheDocument()
  })

  it('shows recent posts section', () => {
    render(<Home />)

    expect(screen.getByText('Recent Posts')).toBeInTheDocument()
    expect(screen.getByText('No posts yet. Sign in to create your first post!')).toBeInTheDocument()
  })
})
