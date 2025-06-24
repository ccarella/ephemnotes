'use client'

import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { TYPOGRAPHY, SPACING, TOUCH_TARGETS } from '@/lib/responsive'

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
        className={`${SPACING.component.padding} border rounded-lg animate-pulse`}
      >
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-5 w-full sm:w-48 bg-muted rounded" />
          </div>
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded mt-4" />
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
      className={`${SPACING.component.padding} border rounded-lg hover:bg-muted/50 transition-colors ${href ? TOUCH_TARGETS.link : ''}`}
    >
      <div className="space-y-3">
        {/* Header section with username and title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
          <span className={`${TYPOGRAPHY.body.small} text-muted-foreground whitespace-nowrap`}>
            {username} wrote:
          </span>
          <h3 
            data-testid="post-title" 
            className={`${TYPOGRAPHY.body.base} font-semibold line-clamp-1 sm:line-clamp-none sm:truncate`}
          >
            {title}
          </h3>
        </div>
        
        {/* Body preview */}
        {body && (
          <p className={`${TYPOGRAPHY.body.base} text-muted-foreground line-clamp-2 sm:line-clamp-3`}>
            {body}
          </p>
        )}
        
        {/* Timestamp */}
        {createdAt && (
          <time 
            className={`${TYPOGRAPHY.body.small} text-muted-foreground/70`}
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
        className={`block ${TOUCH_TARGETS.link} focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg`}
      >
        {content}
      </Link>
    )
  }

  return content
}