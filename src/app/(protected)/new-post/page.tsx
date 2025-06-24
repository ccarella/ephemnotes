'use client'

import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import { createPost } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabase } from '@/providers/supabase-provider'
import { typography, presets } from '@/lib/design-system'

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
    <div className={presets.contentPage}>
      <header className="mb-8">
        <h1 className={typography.title}>
          Write
        </h1>
      </header>

      <main>
        <PostForm onSubmit={handleSubmit} />
      </main>
    </div>
  )
}