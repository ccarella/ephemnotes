'use client'

import { PostItem } from './PostItem'
import type { Post } from '@/lib/posts'

interface PostFeedProps {
  posts?: Post[] | null
  isLoading?: boolean
  error?: Error | null
}

export function PostFeed({ posts, isLoading = false, error = null }: PostFeedProps) {
  if (isLoading) {
    return (
      <>
        <PostItem isLoading />
        <PostItem isLoading />
        <PostItem isLoading />
      </>
    )
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg border-destructive">
        <p className="text-destructive font-semibold">Error loading posts</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try refreshing the page.
        </p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-muted-foreground">
          No posts yet. Sign in to create your first post!
        </p>
      </div>
    )
  }

  return (
    <>
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post}
          href={`/posts/${post.id}`}
        />
      ))}
    </>
  )
}