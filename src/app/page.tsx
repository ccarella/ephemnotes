import { NavBar } from '@/components/NavBar'
import { PostFeed } from '@/components/PostFeed'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPosts } from '@/lib/posts'
import { Suspense } from 'react'
import Link from 'next/link'

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
      <div>
        <header className="text-center" style={{ marginTop: '80px' }}>
          <h1 
            className="text-display-1 font-serif text-text-primary"
            style={{ fontWeight: 500 }}
          >
            Latest Post
          </h1>
          <p 
            className="font-serif text-text-secondary"
            style={{ fontSize: '24px', fontWeight: 400, marginTop: '8px' }}
          >
            A thought worth sharing, briefly expressed
          </p>
        </header>

        <main className="flex flex-col items-center" style={{ marginTop: '40px', paddingBottom: '80px' }}>
          <Suspense fallback={<PostFeed isLoading />}>
            <PostsList />
          </Suspense>
          
          <Link 
            href="/new-post"
            className="bg-brand-blue text-white text-caption font-semibold hover:bg-blue-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2 inline-flex items-center justify-center"
            style={{ 
              width: '240px',
              height: '48px',
              borderRadius: '4px',
              marginTop: '40px',
              textDecoration: 'none'
            }}
          >
            CREATE POST
          </Link>
        </main>
      </div>
    </div>
  )
}
