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
    <div className="min-h-screen p-4">
      <header className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold">Create Post</h1>
        <p className="text-muted-foreground mt-2">Share your ephemeral thought</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <PostForm onSubmit={handleSubmit} />
      </main>
    </div>
  )
}