'use client'

import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import { createPost } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabase } from '@/providers/supabase-provider'
import { SPACING, TYPOGRAPHY } from '@/lib/responsive'

export default function NewPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { supabase } = useSupabase()

  const handleSubmit = async (data: { title: string; body: string }) => {
    if (!user || !supabase) {
      throw new Error('You must be logged in to create a post')
    }

    await createPost(supabase, {
      title: data.title,
      body: data.body,
      user_id: user.id,
      username: user.user_metadata.username || user.email?.split('@')[0] || 'Anonymous',
    })

    router.push('/my-post')
  }

  return (
    <div className="min-h-screen">
      <div className={`${SPACING.container.padding} ${SPACING.container.maxWidthNarrow}`}>
        <header className={SPACING.section.paddingSmall}>
          <h1 className={TYPOGRAPHY.heading.h1}>Create Post</h1>
          <p className={`${TYPOGRAPHY.body.base} text-muted-foreground mt-2`}>Share your ephemeral thought</p>
        </header>

        <main>
          <PostForm onSubmit={handleSubmit} />
        </main>
      </div>
    </div>
  )
}