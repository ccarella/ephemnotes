'use client'

import { useEffect } from 'react'
import { PostItem } from './PostItem'
import type { Post } from '@/lib/posts'
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
      <div className="space-y-4 animate-fade-in">
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
      <div className="p-6 border rounded-xl border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 animate-fade-in">
        <p className="text-red-800 dark:text-red-400 font-medium text-base">
          {isNetworkError ? 'Connection Error' : 'Unable to Load Posts'}
        </p>
        <p className="text-red-700 dark:text-red-500 text-sm mt-2 leading-relaxed">
          {isNetworkError 
            ? 'Check your internet connection and try again.' 
            : 'Something went wrong while loading posts. Please try again.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}
      </div>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="p-8 border border-border rounded-xl bg-gray-50/50 dark:bg-gray-900/20 text-center animate-fade-in">
        <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <p className="text-muted text-base">
          No posts yet. Sign in to create your first post!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
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