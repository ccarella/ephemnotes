'use client'

import Link from 'next/link'
import type { Post } from '@/lib/database.types'

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
        className="p-4 border rounded-lg animate-pulse"
      >
        <div className="flex items-baseline gap-2">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-12 bg-muted rounded" />
          <div className="h-5 w-48 bg-muted rounded" />
        </div>
      </div>
    )
  }

  const username = post?.username || 'Anonymous'
  const title = post?.title || '(Untitled)'

  const content = (
    <div 
      data-testid="post-item"
      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">{username} wrote:</span>
        <span data-testid="post-title" className="font-semibold truncate">
          {title}
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}