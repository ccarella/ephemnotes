import { NavBar } from '@/components/NavBar'
import { PostFeed } from '@/components/PostFeed'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPosts } from '@/lib/posts'
import { Suspense } from 'react'

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
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl py-12 sm:py-16 lg:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
            EphemNotes
          </h1>
          <p className="text-lg text-muted mt-4 leading-relaxed">
            Share your ephemeral thoughts
          </p>
        </header>

        <main className="mx-auto max-w-3xl pb-12 sm:pb-16 lg:pb-20">
          <div className="space-y-8">
            <h2 className="text-xl sm:text-2xl font-medium text-foreground">
              Recent Posts
            </h2>
            <Suspense fallback={<PostFeed isLoading />}>
              <PostsList />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
