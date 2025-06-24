'use client'

import { PostItem } from './PostItem'
import type { Post } from '@/lib/posts'
import { SPACING, TYPOGRAPHY } from '@/lib/responsive'

interface PostFeedProps {
  posts?: Post[] | null
  isLoading?: boolean
  error?: Error | null
}

export function PostFeed({ posts, isLoading = false, error = null }: PostFeedProps) {
  if (isLoading) {
    return (
      <div className={SPACING.section.gapSmall}>
        <PostItem isLoading />
        <PostItem isLoading />
        <PostItem isLoading />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${SPACING.component.padding} border rounded-lg border-destructive`}>
        <p className={`text-destructive font-semibold ${TYPOGRAPHY.body.base}`}>
          Error loading posts
        </p>
        <p className={`${TYPOGRAPHY.body.small} text-muted-foreground mt-1`}>
          Please try refreshing the page.
        </p>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={`${SPACING.component.padding} border rounded-lg`}>
        <p className={`text-muted-foreground ${TYPOGRAPHY.body.base}`}>
          No posts yet. Sign in to create your first post!
        </p>
      </div>
    )
  }

  return (
    <div className={SPACING.section.gapSmall}>
      {posts.map((post) => (
        <PostItem 
          key={post.id} 
          post={post}
          href={`/posts/${post.id}`}
        />
      ))}
    </div>
  )
}