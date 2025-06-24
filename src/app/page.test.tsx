import { render, screen } from '@/test/test-utils'
import Home from './page'

describe('Home Page', () => {
  it('renders the home page structure', () => {
    render(<Home />)

    expect(screen.getByRole('heading', { name: 'EphemNotes' })).toBeInTheDocument()
    expect(screen.getByText('Share your ephemeral thoughts')).toBeInTheDocument()
    expect(screen.getByText('Recent Posts')).toBeInTheDocument()
  })

  it('renders navigation bar', () => {
    render(<Home />)
    
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<Home />)
    
    const skeletons = screen.getAllByTestId('post-item-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
