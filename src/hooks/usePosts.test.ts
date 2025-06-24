import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePosts } from './usePosts'
import useSWR from 'swr'
import type { Post } from '@/test/mocks'

vi.mock('swr')

describe('usePosts', () => {
  it('should fetch posts successfully', () => {
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
      }
    ]

    vi.mocked(useSWR).mockReturnValue({
      data: { posts: mockPosts },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    } as ReturnType<typeof useSWR>)

    const { result } = renderHook(() => usePosts())

    expect(result.current.posts).toEqual(mockPosts)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(vi.mocked(useSWR)).toHaveBeenCalledWith('/api/posts', expect.any(Function))
  })

  it('should handle loading state', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn()
    } as ReturnType<typeof useSWR>)

    const { result } = renderHook(() => usePosts())

    expect(result.current.posts).toBeUndefined()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch')
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    } as ReturnType<typeof useSWR>)

    const { result } = renderHook(() => usePosts())

    expect(result.current.posts).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
  })
})