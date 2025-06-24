import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createServerSupabaseClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
import type { MockSupabaseClient, Post } from '@/test/mocks'

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn()
}))

describe('POST /api/post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new post successfully', async () => {
    const mockUser = { id: 'user123' }
    const newPostData = {
      title: 'New Test Post',
      body: 'New test body content',
      published: true
    }
    const mockCreatedPost: Post = {
      id: 'post123',
      user_id: 'user123',
      username: 'testuser',
      ...newPostData,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockCreatedPost, error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify(newPostData)
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual({ post: mockCreatedPost })
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      ...newPostData,
      user_id: 'user123'
    })
  })

  it('should update an existing post successfully', async () => {
    const mockUser = { id: 'user123' }
    const updateData = {
      id: 'post123',
      title: 'Updated Test Post',
      body: 'Updated test body content',
      published: false
    }
    const mockUpdatedPost: Post = {
      ...updateData,
      user_id: 'user123',
      username: 'testuser',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUpdatedPost, error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify(updateData)
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ post: mockUpdatedPost })
    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(mockSupabase.update).toHaveBeenCalledWith({
      title: updateData.title,
      body: updateData.body,
      published: updateData.published,
      updated_at: expect.any(String)
    })
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'post123')
    expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user123')
  })

  it('should return 401 when user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
      }
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', body: 'Test' })
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 400 when title is missing', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      }
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify({ body: 'Test body' })
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Title is required' })
  })

  it('should return 400 for invalid JSON', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      }
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: 'invalid json'
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid request body' })
  })

  it('should handle database errors on create', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', body: 'Test' })
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to save post' })
  })

  it('should handle database errors on update', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify({ id: 'post123', title: 'Test', body: 'Test' })
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to update post' })
  })

  it('should return 404 when updating non-existent post', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows found' } 
      })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify({ id: 'post123', title: 'Test', body: 'Test' })
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Post not found or unauthorized' })
  })

  it('should include proper headers', async () => {
    const mockUser = { id: 'user123' }
    const mockPost: Post = {
      id: 'post123',
      user_id: 'user123',
      username: 'testuser',
      title: 'Test',
      body: 'Test',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPost, error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const request = new NextRequest('http://localhost:3000/api/post', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test', body: 'Test' })
    })
    const response = await POST(request)

    expect(response.headers.get('Content-Type')).toBe('application/json')
  })
})