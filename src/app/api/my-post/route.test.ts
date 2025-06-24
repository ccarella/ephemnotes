import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { MockSupabaseClient, Post } from '@/test/mocks'

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn()
}))

describe('GET /api/my-post', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return the current user post successfully', async () => {
    const mockUser = { id: 'user123' }
    const mockPost: Post = {
      id: '1',
      user_id: 'user123',
      username: 'testuser',
      title: 'My Test Post',
      body: 'Test body content',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPost, error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ post: mockPost })
    expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(mockSupabase.select).toHaveBeenCalledWith('*')
    expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user123')
    expect(mockSupabase.single).toHaveBeenCalled()
  })

  it('should return 401 when user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null })
      }
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should return 404 when user has no post', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'No rows found' } 
      })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'No post found for this user' })
  })

  it('should handle authentication errors', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: null }, 
          error: { message: 'Auth service error' } 
        })
      }
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
  })

  it('should handle database errors', async () => {
    const mockUser = { id: 'user123' }
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection error' } 
      })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch post' })
  })

  it('should include proper headers', async () => {
    const mockUser = { id: 'user123' }
    const mockPost: Post = {
      id: '1',
      user_id: 'user123',
      username: 'testuser',
      title: 'My Test Post',
      body: 'Test body content',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPost, error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()

    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
  })
})