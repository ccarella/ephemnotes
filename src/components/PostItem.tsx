'use client'

import Link from 'next/link'
import type { Post } from '@/lib/posts'
import { Skeleton } from '@/components/Skeleton'
import { typography, layout, spacing, cn } from '@/lib/design-system'

interface PostItemProps {
  post?: Post
  isLoading?: boolean
  href?: string
}

export function PostItem({ post, isLoading = false, href }: PostItemProps) {
  if (isLoading) {
    return (
      <article className={cn(layout.card, 'animate-fade-in')}>
        <div className={spacing.stack.md}>
          <Skeleton className="h-7 w-3/4" />
          <div className={spacing.stack.sm}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </article>
    )
  }

  const title = post?.title || 'Untitled'
  const body = post?.body || ''
  const createdAt = post?.created_at ? new Date(post.created_at) : null
  
  // Format timestamp for minimal display
  const formatTimestamp = (date: Date | null) => {
    if (!date) return ''
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return 'Now'
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    if (days < 30) return `${Math.floor(days / 7)}w`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const content = (
    <article className={cn(layout.card, href && 'cursor-pointer')}>
      <div className={spacing.stack.sm}>
        {/* Title - clean and prominent */}
        <h2 className={cn(typography.h2, 'text-foreground')}>
          {title}
        </h2>
        
        {/* Body preview - optimized for readability */}
        {body && (
          <p className={cn(typography.body.DEFAULT, 'text-secondary line-clamp-3')}>
            {body}
          </p>
        )}
        
        {/* Minimal timestamp */}
        {createdAt && (
          <time 
            className={cn(typography.ui.small, 'text-muted')}
            dateTime={createdAt.toISOString()}
          >
            {formatTimestamp(createdAt)}
          </time>
        )}
      </div>
    </article>
  )

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    )
  }

  return content
}