'use client'

import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { Skeleton } from '@/components/Skeleton'

interface PostItemProps {
  post?: Post
  isLoading?: boolean
  href?: string
}

export function PostItem({ post, isLoading = false, href }: PostItemProps) {
  if (isLoading) {
    return (
      <div 
        data-testid="post-item-skeleton"
        className="p-5 border border-border rounded-xl bg-gray-50/50 dark:bg-gray-900/20 animate-fade-in"
      >
        <div className="space-y-3">
          {/* Header section with username and title */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full sm:w-48" />
          </div>
          
          {/* Body preview - 2 lines */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Timestamp */}
          <Skeleton className="h-3 w-32 mt-4" />
        </div>
      </div>
    )
  }

  const username = post?.username || 'Anonymous'
  const title = post?.title || '(Untitled)'
  const body = post?.body || ''
  const createdAt = post?.created_at ? new Date(post.created_at) : null
  
  // Format timestamp for display
  const formatTimestamp = (date: Date | null) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes <= 1 ? 'just now' : `${minutes}m ago`
      }
      return `${hours}h ago`
    } else if (days === 1) {
      return 'yesterday'
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const content = (
    <div 
      data-testid="post-item"
      className={`p-5 border border-border rounded-xl hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm bg-background transition-all duration-150 ${href ? 'cursor-pointer' : ''}`}
    >
      <div className="space-y-3">
        {/* Header section with username and title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <span className="text-sm text-muted whitespace-nowrap">
            {username}
          </span>
          <h3 
            data-testid="post-title" 
            className="text-base font-medium text-foreground line-clamp-1 sm:line-clamp-none sm:truncate"
          >
            {title}
          </h3>
        </div>
        
        {/* Body preview */}
        {body && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2 sm:line-clamp-3">
            {body}
          </p>
        )}
        
        {/* Timestamp */}
        {createdAt && (
          <time 
            className="text-xs text-muted/70"
            dateTime={createdAt.toISOString()}
          >
            {formatTimestamp(createdAt)}
          </time>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link 
        href={href} 
        className="block focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-xl"
      >
        {content}
      </Link>
    )
  }

  return content
}