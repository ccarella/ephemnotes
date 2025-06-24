import useSWR from 'swr'
import { Database } from '@/lib/database.types'

type Post = Database['public']['Tables']['posts']['Row']

interface PostsResponse {
  posts: Post[]
}

const fetcher = async (url: string): Promise<PostsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }
  return response.json()
}

export function usePosts() {
  const { data, error, isLoading, mutate } = useSWR<PostsResponse>('/api/posts', fetcher)

  return {
    posts: data?.posts,
    isLoading,
    error,
    mutate
  }
}