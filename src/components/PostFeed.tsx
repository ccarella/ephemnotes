'use client'

import { useEffect } from 'react'
import { PostItem } from './PostItem'
import type { Post } from '@/lib/posts'
import { SPACING, TYPOGRAPHY } from '@/lib/responsive'
import { useToast } from '@/lib/toast'

interface PostFeedProps {
  posts?: Post[] | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function PostFeed({ posts, isLoading = false, error = null, onRetry }: PostFeedProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      // Show error toast
      toast.error('Failed to load posts')
    }
  }, [error, toast])

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
    // Check if it's a network error
    const isNetworkError = 
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch') ||
      error.name === 'NetworkError'

    return (
      <div className={`${SPACING.component.padding} border rounded-lg border-destructive`}>
        <p className={`text-destructive font-semibold ${TYPOGRAPHY.body.base}`}>
          {isNetworkError ? 'Connection Error' : 'Unable to Load Posts'}
        </p>
        <p className={`${TYPOGRAPHY.body.small} text-muted-foreground mt-1`}>
          {isNetworkError 
            ? 'Check your internet connection and try again.' 
            : 'Something went wrong while loading posts. Please try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ${TYPOGRAPHY.body.small} font-medium`}
          >
            Try Again
          </button>
        )}
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