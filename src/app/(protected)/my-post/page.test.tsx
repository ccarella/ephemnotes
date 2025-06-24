import { render, screen } from '@testing-library/react'
import MyPostPage from './page'

describe('MyPost Page', () => {
  it('renders the my post page with title', () => {
    render(<MyPostPage />)

    expect(screen.getByText('My Post')).toBeInTheDocument()
    expect(screen.getByText('View and manage your ephemeral thought')).toBeInTheDocument()
  })

  it('shows empty state when no post exists', () => {
    render(<MyPostPage />)

    expect(screen.getByText('Your Current Post')).toBeInTheDocument()
    expect(screen.getByText("You haven't created a post yet.")).toBeInTheDocument()
  })

  it('has a link to create first post', () => {
    render(<MyPostPage />)

    const createLink = screen.getByText('Create Your First Post')
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute('href', '/edit')
  })
})
