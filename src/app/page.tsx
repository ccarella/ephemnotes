import { NavBar } from '@/components/NavBar'
import { PostFeed } from '@/components/PostFeed'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getPosts } from '@/lib/posts'
import { Suspense } from 'react'
import { SPACING, TYPOGRAPHY } from '@/lib/responsive'

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
      <div className={SPACING.container.padding}>
        <header className={`${SPACING.container.maxWidthNarrow} ${SPACING.section.paddingSmall}`}>
          <h1 className={TYPOGRAPHY.heading.h1}>EphemNotes</h1>
          <p className={`text-muted-foreground mt-2 ${TYPOGRAPHY.body.large}`}>Share your ephemeral thoughts</p>
        </header>

        <main className={SPACING.container.maxWidthNarrow}>
          <div className={SPACING.section.gapSmall}>
            <h2 className={`${TYPOGRAPHY.heading.h3} mb-4 sm:mb-6`}>Recent Posts</h2>
            <div className={SPACING.section.gapSmall}>
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
