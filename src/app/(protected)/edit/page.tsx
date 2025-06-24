'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PostForm from '@/components/PostForm'
import { getPostById, updatePost } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabase } from '@/providers/supabase-provider'
import { SPACING, TYPOGRAPHY } from '@/lib/responsive'

function EditPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('id')
  const { user } = useAuth()
  const { supabase } = useSupabase()
  const [post, setPost] = useState<{ title: string; body: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!postId) {
      router.push('/new-post')
      return
    }

    const fetchPost = async () => {
      if (!supabase) {
        setError('Unable to connect to database')
        setIsLoading(false)
        return
      }
      
      try {
        const data = await getPostById(supabase, postId)
        if (!data) {
          throw new Error('Post not found')
        }
        if (data.user_id !== user?.id) {
          throw new Error('You can only edit your own posts')
        }
        setPost({
          title: data.title,
          body: data.body || '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId, user?.id, router, supabase])

  const handleSubmit = async (data: { title: string; body: string }) => {
    if (!postId || !user || !supabase) {
      throw new Error('Invalid state')
    }

    await updatePost(supabase, postId, {
      title: data.title,
      body: data.body,
    })

    router.push('/my-post')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={SPACING.container.padding}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className={`${SPACING.container.padding} ${SPACING.container.maxWidthNarrow}`}>
          <div className={SPACING.section.paddingSmall}>
            <div className={`rounded-md bg-red-50 ${SPACING.component.padding} text-red-600`}>
              <p>{error}</p>
              <button
                onClick={() => router.push('/my-post')}
                className={`mt-2 ${TYPOGRAPHY.body.small} underline`}
              >
                Go back to your posts
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className={`${SPACING.container.padding} ${SPACING.container.maxWidthNarrow}`}>
        <header className={SPACING.section.paddingSmall}>
          <h1 className={TYPOGRAPHY.heading.h1}>Edit Post</h1>
          <p className={`${TYPOGRAPHY.body.base} text-muted-foreground mt-2`}>Update your ephemeral thought</p>
        </header>

        <main>
          {post && <PostForm initialData={post} onSubmit={handleSubmit} isEditing />}
        </main>
      </div>
    </div>
  )
}

export default function EditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className={SPACING.container.padding}>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <EditPageContent />
    </Suspense>
  )
}
