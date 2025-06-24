import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostItem } from './PostItem'
import type { Post } from '@/lib/database.types'

describe('PostItem', () => {
  const mockPost: Post = {
    id: '1',
    user_id: 'user-123',
    username: 'testuser',
    title: 'Test Post Title',
    body: 'Test post body content',
    published: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('renders post with username and title in correct format', () => {
    render(<PostItem post={mockPost} />)
    
    expect(screen.getByText('testuser wrote:')).toBeInTheDocument()
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(<PostItem isLoading />)
    
    expect(screen.getByTestId('post-item-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('wrote:')).not.toBeInTheDocument()
  })

  it('handles post without username gracefully', () => {
    const postWithoutUsername = { ...mockPost, username: null }
    render(<PostItem post={postWithoutUsername} />)
    
    expect(screen.getByText('Anonymous wrote:')).toBeInTheDocument()
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('handles post with empty title', () => {
    const postWithEmptyTitle = { ...mockPost, title: '' }
    render(<PostItem post={postWithEmptyTitle} />)
    
    expect(screen.getByText('testuser wrote:')).toBeInTheDocument()
    expect(screen.getByText('(Untitled)')).toBeInTheDocument()
  })

  it('truncates very long titles', () => {
    const longTitle = 'A'.repeat(150)
    const postWithLongTitle = { ...mockPost, title: longTitle }
    render(<PostItem post={postWithLongTitle} />)
    
    const titleElement = screen.getByTestId('post-title')
    expect(titleElement).toHaveClass('truncate')
  })

  it('applies correct styling for post item', () => {
    render(<PostItem post={mockPost} />)
    
    const container = screen.getByTestId('post-item')
    expect(container).toHaveClass('p-4')
    expect(container).toHaveClass('border')
    expect(container).toHaveClass('rounded-lg')
  })

  it('renders multiple loading skeletons with different animation delays', () => {
    const { container } = render(
      <>
        <PostItem isLoading />
        <PostItem isLoading />
        <PostItem isLoading />
      </>
    )
    
    const skeletons = container.querySelectorAll('[data-testid="post-item-skeleton"]')
    expect(skeletons).toHaveLength(3)
  })

  it('handles post with all null/undefined fields', () => {
    const emptyPost: Partial<Post> = {
      id: '1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    render(<PostItem post={emptyPost as Post} />)
    
    expect(screen.getByText('Anonymous wrote:')).toBeInTheDocument()
    expect(screen.getByText('(Untitled)')).toBeInTheDocument()
  })

  it('makes post clickable when href is provided', () => {
    render(<PostItem post={mockPost} href="/posts/1" />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/posts/1')
  })

  it('renders as div when no href is provided', () => {
    render(<PostItem post={mockPost} />)
    
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByTestId('post-item').tagName).toBe('DIV')
  })
})