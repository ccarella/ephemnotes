import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePost } from './usePost'

global.fetch = vi.fn()

describe('usePost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new post successfully', async () => {
    const mockPost = {
      id: '1',
      user_id: 'user123',
      username: 'testuser',
      title: 'New Post',
      body: 'New body',
      published: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ post: mockPost })
    } as Response)

    const { result } = renderHook(() => usePost())

    let response
    await act(async () => {
      response = await result.current.createPost({
        title: 'New Post',
        body: 'New body',
        published: true
      })
    })

    expect(response).toEqual({ post: mockPost })
    expect(fetch).toHaveBeenCalledWith('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Post',
        body: 'New body',
        published: true
      })
    })
  })

  it('should update an existing post successfully', async () => {
    const mockPost = {
      id: '1',
      user_id: 'user123',
      username: 'testuser',
      title: 'Updated Post',
      body: 'Updated body',
      published: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ post: mockPost })
    } as Response)

    const { result } = renderHook(() => usePost())

    let response
    await act(async () => {
      response = await result.current.updatePost({
        id: '1',
        title: 'Updated Post',
        body: 'Updated body',
        published: false
      })
    })

    expect(response).toEqual({ post: mockPost })
    expect(fetch).toHaveBeenCalledWith('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '1',
        title: 'Updated Post',
        body: 'Updated body',
        published: false
      })
    })
  })

  it('should handle errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Failed to save post' })
    } as Response)

    const { result } = renderHook(() => usePost())

    await expect(
      act(async () => {
        await result.current.createPost({
          title: 'New Post',
          body: 'New body'
        })
      })
    ).rejects.toThrow('Failed to save post')
  })
})