import { NavBar } from '@/components/NavBar'
import { PostFeed } from '@/components/PostFeed'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPosts } from '@/lib/posts'
import { Suspense } from 'react'
import Link from 'next/link'
import { layout, presets, cn } from '@/lib/design-system'

async function PostsList() {
  let posts: Awaited<ReturnType<typeof getPosts>> = []
  let error: Error | null = null

  try {
    const supabase = await createServerSupabaseClient()
    posts = await getPosts(supabase)
  } catch (err) {
    console.error('Error fetching posts:', err)
    error = err instanceof Error ? err : new Error('Failed to fetch posts')
  }

  return <PostFeed posts={posts} error={error} />
}

export default function Home() {
  return (
    <div className={layout.page}>
      <NavBar />
      <div className={layout.container}>
        {/* Hero section - responsive typography */}
        <header className="text-center pt-16 pb-12 sm:pt-20 sm:pb-16">
          <h1 className={cn(
            'font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-tight',
            'text-foreground'
          )}>
            EphemNotes
          </h1>
          <p className={cn(
            'font-serif text-lg sm:text-xl md:text-2xl font-normal mt-2',
            'text-secondary'
          )}>
            Share your ephemeral thoughts
          </p>
        </header>

        {/* Main content area with optimal width */}
        <main className="pb-16 sm:pb-20">
          <Suspense fallback={<PostFeed isLoading />}>
            <PostsList />
          </Suspense>
          
          {/* Centered CTA button */}
          <div className="flex justify-center mt-8 sm:mt-12">
            <Link 
              href="/new-post"
              className={cn(
                presets.primaryButton,
                'px-8 py-3 text-base no-underline'
              )}
            >
              Write
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}