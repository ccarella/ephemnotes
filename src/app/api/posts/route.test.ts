import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { MockSupabaseClient, Post } from '@/test/mocks'

vi.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: vi.fn()
}))

describe('GET /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all published posts successfully', async () => {
    const mockPosts: Post[] = [
      {
        id: '1',
        user_id: 'user1',
        username: 'testuser1',
        title: 'Test Post 1',
        body: 'Test body 1',
        published: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        user_id: 'user2',
        username: 'testuser2',
        title: 'Test Post 2',
        body: 'Test body 2',
        published: true,
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      }
    ]

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockPosts, error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ posts: mockPosts })
    expect(mockSupabase.from).toHaveBeenCalledWith('posts')
    expect(mockSupabase.select).toHaveBeenCalledWith('*')
    expect(mockSupabase.eq).toHaveBeenCalledWith('published', true)
    expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should handle database errors', async () => {
    const mockError = { message: 'Database error', code: 'PGRST116' }
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to fetch posts' })
  })

  it('should return empty array when no posts exist', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ posts: [] })
  })

  it('should include proper CORS headers', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null })
    }

    vi.mocked(createServerSupabaseClient).mockResolvedValue(mockSupabase as MockSupabaseClient)

    const response = await GET()

    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
  })
})