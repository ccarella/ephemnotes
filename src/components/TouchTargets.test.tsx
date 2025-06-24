import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostForm from './PostForm'
import { PostItem } from './PostItem'

describe('Touch-Friendly Tap Targets', () => {
  describe('PostForm', () => {
    it('should have touch-friendly input fields', () => {
      render(<PostForm />)
      
      const titleInput = screen.getByLabelText('Title')
      expect(titleInput.className).toContain('min-h-[44px]')
      
      const bodyTextarea = screen.getByLabelText('Body')
      expect(bodyTextarea.className).toContain('min-h-[150px]')
    })

    it('should have touch-friendly buttons', () => {
      render(<PostForm />)
      
      const submitButton = screen.getByText('Publish Post')
      expect(submitButton.className).toContain('min-h-[44px]')
      
      const cancelButton = screen.getByText('Cancel')
      expect(cancelButton.className).toContain('min-h-[44px]')
    })
  })

  describe('PostItem', () => {
    it('should render with proper styling', () => {
      const mockPost = {
        id: '1',
        title: 'Test Post',
        body: 'Test body content',
        author_id: '123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: {
          email: 'test@example.com',
        },
      }
      
      render(<PostItem post={mockPost} />)
      
      const title = screen.getByText('Test Post')
      expect(title).toBeDefined()
    })
  })
})