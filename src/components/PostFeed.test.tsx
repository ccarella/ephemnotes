import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostFeed } from './PostFeed'
import type { Post } from '@/lib/database.types'

describe('PostFeed', () => {
  const mockPosts: Post[] = [
    {
      id: '1',
      user_id: 'user-1',
      username: 'alice',
      title: 'First Post',
      body: 'Body 1',
      published: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
    {
      id: '2',
      user_id: 'user-2',
      username: 'bob',
      title: 'Second Post',
      body: 'Body 2',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ]

  it('displays loading skeletons when isLoading is true', () => {
    render(<PostFeed isLoading />)
    
    const skeletons = screen.getAllByTestId('post-item-skeleton')
    expect(skeletons).toHaveLength(3)
  })

  it('displays error state when error is provided', () => {
    const error = new Error('Failed to fetch posts')
    render(<PostFeed error={error} />)
    
    expect(screen.getByText('Error loading posts')).toBeInTheDocument()
    expect(screen.getByText('Please try refreshing the page.')).toBeInTheDocument()
  })

  it('displays empty state when posts array is empty', () => {
    render(<PostFeed posts={[]} />)
    
    expect(screen.getByText('No posts yet. Sign in to create your first post!')).toBeInTheDocument()
  })

  it('displays empty state when posts is null', () => {
    render(<PostFeed posts={null} />)
    
    expect(screen.getByText('No posts yet. Sign in to create your first post!')).toBeInTheDocument()
  })

  it('displays posts when available', () => {
    render(<PostFeed posts={mockPosts} />)
    
    expect(screen.getByText('alice wrote:')).toBeInTheDocument()
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('bob wrote:')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
  })

  it('creates links to individual posts', () => {
    render(<PostFeed posts={mockPosts} />)
    
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/posts/1')
    expect(links[1]).toHaveAttribute('href', '/posts/2')
  })

  it('renders posts in the order provided', () => {
    render(<PostFeed posts={mockPosts} />)
    
    const posts = screen.getAllByTestId('post-item')
    expect(posts[0]).toHaveTextContent('alice wrote:')
    expect(posts[0]).toHaveTextContent('First Post')
    expect(posts[1]).toHaveTextContent('bob wrote:')
    expect(posts[1]).toHaveTextContent('Second Post')
  })
})