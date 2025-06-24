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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--paper)' }}>
      <NavBar />
      <div className="mx-auto" style={{ maxWidth: '720px', padding: '0 40px' }}>
        <header className="text-center" style={{ marginTop: '80px' }}>
          <h1 
            className="font-serif"
            style={{ 
              fontSize: '72px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              lineHeight: 1.1
            }}
          >
            EphemNotes
          </h1>
          <p 
            className="font-serif"
            style={{ 
              fontSize: '24px', 
              fontWeight: 400, 
              marginTop: '8px',
              color: 'var(--text-secondary)'
            }}
          >
            Share your ephemeral thoughts
          </p>
        </header>

        <main className="flex flex-col items-center" style={{ marginTop: '40px', paddingBottom: '80px' }}>
          <Suspense fallback={<PostFeed isLoading />}>
            <PostsList />
          </Suspense>
          
          <Link 
            href="/new-post"
            className="text-white font-semibold hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2 inline-flex items-center justify-center"
            style={{ 
              backgroundColor: 'var(--brand-blue)',
              width: '240px',
              height: '48px',
              borderRadius: '24px',
              marginTop: '40px',
              textDecoration: 'none',
              fontSize: '16px'
            }}
          >
            New Post
          </Link>
        </main>
      </div>
    </div>
  )
}
