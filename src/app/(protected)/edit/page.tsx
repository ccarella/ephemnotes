'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditPage() {
  const [content, setContent] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement post creation/update logic with Supabase
    console.log('Submitting post:', content)
    router.push('/my-post')
  }

  return (
    <div className="min-h-screen p-4">
      <header className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold">Create/Edit Post</h1>
        <p className="text-muted-foreground mt-2">Share your ephemeral thought</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-2">
                Your Ephemeral Thought
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border rounded-lg min-h-[200px] focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="What's on your mind? Remember, this post will disappear after 24 hours..."
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
              >
                Publish Post
              </button>
              <button
                type="button"
                onClick={() => router.push('/my-post')}
                className="px-6 py-2 border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
