import useSWR from 'swr'
import { Database } from '@/lib/database.types'

type Post = Database['public']['Tables']['posts']['Row']

interface MyPostResponse {
  post?: Post
  error?: string
}

const fetcher = async (url: string): Promise<MyPostResponse> => {
  const response = await fetch(url)
  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to fetch post')
  }
  return response.json()
}

export function useMyPost() {
  const { data, error, isLoading, mutate } = useSWR<MyPostResponse>('/api/my-post', fetcher)

  return {
    post: data?.post,
    isLoading,
    error,
    mutate
  }
}