import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getPosts,
  getPostById,
  getPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  type Post,
  type PostInsert,
} from './posts'
import type { Mock } from 'vitest'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}))

interface MockSupabaseClient {
  from: Mock
}

describe('Posts Operations', () => {
  let mockSupabase: MockSupabaseClient
  let mockFrom: Mock
  let mockSelect: Mock
  let mockInsert: Mock
  let mockUpdate: Mock
  let mockDelete: Mock
  let mockEq: Mock
  let mockOrder: Mock
  let mockSingle: Mock

  const mockPost: Post = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '987e6543-e89b-12d3-a456-426614174000',
    username: 'testuser',
    title: 'Test Post',
    body: 'This is a test post',
    published: false,
    created_at: '2024-12-23T10:00:00.000Z',
    updated_at: '2024-12-23T10:00:00.000Z',
  }

  beforeEach(() => {
    mockSingle = vi.fn().mockReturnThis()
    mockOrder = vi.fn().mockReturnThis()
    mockEq = vi.fn().mockReturnThis()
    mockSelect = vi.fn().mockReturnThis()
    mockInsert = vi.fn().mockReturnThis()
    mockUpdate = vi.fn().mockReturnThis()
    mockDelete = vi.fn().mockReturnThis()
    mockFrom = vi.fn().mockReturnThis()

    mockSupabase = {
      from: mockFrom,
    }

    // Set up chain returns
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })

    mockSelect.mockReturnValue({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    })

    mockInsert.mockReturnValue({
      select: mockSelect,
    })

    mockUpdate.mockReturnValue({
      eq: mockEq,
    })

    mockDelete.mockReturnValue({
      eq: mockEq,
    })

    mockEq.mockReturnValue({
      single: mockSingle,
      order: mockOrder,
      select: mockSelect,
    })

    mockOrder.mockReturnValue({
      single: mockSingle,
    })
  })

  describe('getPosts', () => {
    it('should fetch all posts ordered by created_at descending', async () => {
      const mockPosts = [mockPost]
      mockOrder.mockResolvedValue({ data: mockPosts, error: null })

      const result = await getPosts(mockSupabase)

      expect(mockFrom).toHaveBeenCalledWith('posts')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockPosts)
    })

    it('should throw error when fetch fails', async () => {
      const mockError = new Error('Database error')
      mockOrder.mockResolvedValue({ data: null, error: mockError })

      await expect(getPosts(mockSupabase)).rejects.toThrow('Database error')
    })
  })

  describe('getPostById', () => {
    it('should fetch a single post by id', async () => {
      mockSingle.mockResolvedValue({ data: mockPost, error: null })

      const result = await getPostById(mockSupabase, mockPost.id)

      expect(mockFrom).toHaveBeenCalledWith('posts')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', mockPost.id)
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockPost)
    })

    it('should throw error when post not found', async () => {
      const mockError = new Error('Post not found')
      mockSingle.mockResolvedValue({ data: null, error: mockError })

      await expect(getPostById(mockSupabase, '123')).rejects.toThrow('Post not found')
    })
  })

  describe('getPostsByUserId', () => {
    it('should fetch posts by user id ordered by created_at descending', async () => {
      const mockPosts = [mockPost]
      mockOrder.mockResolvedValue({ data: mockPosts, error: null })

      const result = await getPostsByUserId(mockSupabase, mockPost.user_id)

      expect(mockFrom).toHaveBeenCalledWith('posts')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('user_id', mockPost.user_id)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockPosts)
    })
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const newPost: PostInsert = {
        user_id: mockPost.user_id,
        username: mockPost.username,
        title: mockPost.title,
        body: mockPost.body,
      }

      mockSingle.mockResolvedValue({ data: mockPost, error: null })

      const result = await createPost(mockSupabase, newPost)

      expect(mockFrom).toHaveBeenCalledWith('posts')
      expect(mockInsert).toHaveBeenCalledWith(newPost)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockPost)
    })

    it('should throw error when create fails', async () => {
      const mockError = new Error('Insert failed')
      mockSingle.mockResolvedValue({ data: null, error: mockError })

      await expect(createPost(mockSupabase, {} as PostInsert)).rejects.toThrow('Insert failed')
    })
  })

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const updates = { title: 'Updated Title', published: true }
      const updatedPost = { ...mockPost, ...updates }

      mockSingle.mockResolvedValue({ data: updatedPost, error: null })

      const result = await updatePost(mockSupabase, mockPost.id, updates)

      expect(mockFrom).toHaveBeenCalledWith('posts')
      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(mockEq).toHaveBeenCalledWith('id', mockPost.id)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(updatedPost)
    })
  })

  describe('deletePost', () => {
    it('should delete a post by id', async () => {
      mockEq.mockResolvedValue({ data: null, error: null })

      await deletePost(mockSupabase, mockPost.id)

      expect(mockFrom).toHaveBeenCalledWith('posts')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', mockPost.id)
    })

    it('should throw error when delete fails', async () => {
      const mockError = new Error('Delete failed')
      mockEq.mockResolvedValue({ data: null, error: mockError })

      await expect(deletePost(mockSupabase, '123')).rejects.toThrow('Delete failed')
    })
  })
})