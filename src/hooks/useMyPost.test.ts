import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMyPost } from './useMyPost'
import useSWR from 'swr'
import type { Post } from '@/test/mocks'

vi.mock('swr')

describe('useMyPost', () => {
  it('should fetch user post successfully', () => {
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

    vi.mocked(useSWR).mockReturnValue({
      data: { post: mockPost },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    } as ReturnType<typeof useSWR>)

    const { result } = renderHook(() => useMyPost())

    expect(result.current.post).toEqual(mockPost)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(vi.mocked(useSWR)).toHaveBeenCalledWith('/api/my-post', expect.any(Function))
  })

  it('should handle loading state', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn()
    } as ReturnType<typeof useSWR>)

    const { result } = renderHook(() => useMyPost())

    expect(result.current.post).toBeUndefined()
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

    const { result } = renderHook(() => useMyPost())

    expect(result.current.post).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
  })

  it('should handle no post found', () => {
    vi.mocked(useSWR).mockReturnValue({
      data: { error: 'No post found for this user' },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn()
    } as ReturnType<typeof useSWR>)

    const { result } = renderHook(() => useMyPost())

    expect(result.current.post).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })
})