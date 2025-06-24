'use client'

import { useEffect, useRef } from 'react'
import { PostItem } from './PostItem'
import type { Post } from '@/lib/posts'
import { useToast } from '@/lib/toast'
import { DatabaseInitGuide } from './DatabaseInitGuide'
import { typography, layout, spacing, presets, cn } from '@/lib/design-system'

interface PostFeedProps {
  posts?: Post[] | null
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
}

export function PostFeed({ posts, isLoading = false, error = null, onRetry }: PostFeedProps) {
  const { toast } = useToast()
  const hasShownError = useRef(false)

  useEffect(() => {
    if (error && !hasShownError.current) {
      const isTableNotFound =
        error.message?.includes('relation') && error.message?.includes('does not exist')

      if (!isTableNotFound) {
        toast.error('Failed to load posts')
        hasShownError.current = true
      }
    }
  }, [error, toast])

  if (isLoading) {
    return (
      <div className={cn(spacing.stack.lg, 'animate-fade-in')}>
        <PostItem isLoading />
        <PostItem isLoading />
        <PostItem isLoading />
      </div>
    )
  }

  if (error) {
    const isTableNotFound =
      (error.message?.includes('relation') && error.message?.includes('does not exist')) ||
      error.message?.includes('posts') && error.message?.includes('does not exist')

    if (isTableNotFound) {
      return <DatabaseInitGuide />
    }

    const isNetworkError =
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch') ||
      error.name === 'NetworkError'

    return (
      <div className={cn(layout.card, 'border-red-200 bg-red-50 animate-fade-in')}>
        <div className={spacing.stack.sm}>
          <h3 className={cn(typography.h3, 'text-red-800')}>
            {isNetworkError ? 'Connection Error' : 'Unable to Load Posts'}
          </h3>
          <p className={cn(typography.body.small, 'text-red-700')}>
            {isNetworkError
              ? 'Check your internet connection and try again.'
              : 'Something went wrong while loading posts. Please try again.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(presets.primaryButton, 'mt-2 bg-red-600 hover:bg-red-700')}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return <EmptyState />
  }

  return (
    <div className={cn(spacing.stack.lg, 'animate-fade-in')}>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} href={`/posts/${post.id}`} />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className={cn(layout.card, 'text-center animate-fade-in')}>
      <div className={cn(spacing.stack.md, 'items-center')}>
        <svg
          className="w-12 h-12 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
        <div>
          <h3 className={cn(typography.h3, 'mb-2')}>No posts yet</h3>
          <p className={cn(typography.body.DEFAULT, 'text-secondary')}>
            Be the first to share your thoughts
          </p>
        </div>
      </div>
    </div>
  )
}