import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPostsByUserId, type Post } from '@/lib/posts'
import { Suspense } from 'react'
import { SPACING, TYPOGRAPHY } from '@/lib/responsive'

function LoadingState() {
  return (
    <div className={`${SPACING.component.padding} border rounded-lg`}>
      <p className="text-muted-foreground">Loading your posts...</p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className={`${SPACING.component.padding} border rounded-lg`}>
      <p className="text-red-500">{message}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className={`${SPACING.component.padding} border rounded-lg`}>
      <h2 className={`${TYPOGRAPHY.heading.h3} mb-4`}>Your Current Post</h2>
      <p className="text-muted-foreground">You haven&apos;t created a post yet.</p>
      <Link
        href="/new-post"
        className="inline-block mt-4 px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
      >
        Create Your First Post
      </Link>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className={`${SPACING.component.padding} border rounded-lg mb-4`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-4">
        <div className="flex-1">
          <h2 className={`${TYPOGRAPHY.heading.h3}`}>{post.title}</h2>
          <p className={`${TYPOGRAPHY.body.small} text-muted-foreground mt-1`}>{formattedDate}</p>
        </div>
        <span className={`px-3 py-1 text-sm rounded-full ${
          post.published 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        }`}>
          {post.published ? 'Published' : 'Draft'}
        </span>
      </div>
      {post.body && (
        <p className="text-muted-foreground mb-4">{post.body}</p>
      )}
      <Link
        href={`/edit?id=${post.id}`}
        className="inline-block px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
      >
        Edit Post
      </Link>
    </div>
  )
}

async function PostsContent() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return <ErrorState message="You must be logged in to view this page" />
  }

  try {
    const posts = await getPostsByUserId(supabase, user.id)
    
    if (posts.length === 0) {
      return <EmptyState />
    }

    return (
      <div>
        <h2 className={`${TYPOGRAPHY.heading.h3} mb-4 sm:mb-6`}>Your Posts</h2>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  } catch {
    return <ErrorState message="Failed to load your posts. Please try again." />
  }
}

export default async function MyPostPage() {
  return (
    <div className="min-h-screen">
      <div className={`${SPACING.container.padding} ${SPACING.container.maxWidthNarrow}`}>
        <header className={SPACING.section.paddingSmall}>
          <h1 className={TYPOGRAPHY.heading.h1}>My Post</h1>
          <p className={`${TYPOGRAPHY.body.base} text-muted-foreground mt-2`}>View and manage your ephemeral thought</p>
        </header>

        <main>
          <div className="pb-8">
            <Suspense fallback={<LoadingState />}>
              <PostsContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
