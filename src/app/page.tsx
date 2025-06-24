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
    <div className="min-h-screen">
      <NavBar />
      <div className="p-4">
        <header className="max-w-4xl mx-auto py-6">
          <h1 className="text-3xl font-bold">EphemNotes</h1>
          <p className="text-muted-foreground mt-2">Share your ephemeral thoughts</p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            <div className="space-y-4">
              <Suspense fallback={<PostFeed isLoading />}>
                <PostsList />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
