import { Database } from '@/lib/database.types'

type Post = Database['public']['Tables']['posts']['Row']
type PostInsert = Omit<Database['public']['Tables']['posts']['Insert'], 'user_id' | 'username'>
type PostUpdate = PostInsert & { id: string }

interface PostResponse {
  post?: Post
  error?: string
}

export function usePost() {
  const createPost = async (data: PostInsert): Promise<PostResponse> => {
    const response = await fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create post')
    }
    
    return result
  }

  const updatePost = async (data: PostUpdate): Promise<PostResponse> => {
    const response = await fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update post')
    }
    
    return result
  }

  return {
    createPost,
    updatePost
  }
}