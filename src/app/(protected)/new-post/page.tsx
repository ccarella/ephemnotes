'use client'

import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import { createPost } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabase } from '@/providers/supabase-provider'

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
      <div className="max-w-3xl mx-auto px-6">
        <header style={{ marginTop: '72px' }}>
          <h1 className="text-display-1 font-serif text-text-primary" style={{ fontWeight: 500 }}>
            Create Post
          </h1>
        </header>

        <main style={{ marginTop: '32px' }}>
          <PostForm onSubmit={handleSubmit} />
        </main>
      </div>
    </div>
  )
}