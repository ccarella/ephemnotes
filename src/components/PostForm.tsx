'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PostFormProps {
  initialData?: {
    id?: string
    title: string
    body: string
  }
  onSubmit: (data: { title: string; body: string }) => Promise<void>
  isEditing?: boolean
}

export default function PostForm({ initialData, onSubmit, isEditing = false }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [body, setBody] = useState(initialData?.body || '')
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validateForm = () => {
    const newErrors: { title?: string; body?: string } = {}
    
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 1 || title.length > 100) {
      newErrors.title = 'Title must be between 1 and 100 characters'
    }
    
    if (!body.trim()) {
      newErrors.body = 'Body is required'
    } else if (body.length < 1 || body.length > 1000) {
      newErrors.body = 'Body must be between 1 and 1000 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await onSubmit({ title: title.trim(), body: body.trim() })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {submitError}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) {
              setErrors({ ...errors, title: undefined })
            }
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your post title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          disabled={isLoading}
          maxLength={100}
        />
        {errors.title && (
          <p id="title-error" className="mt-1 text-sm text-red-600">
            {errors.title}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {title.length}/100 characters
        </p>
      </div>
      
      <div>
        <label htmlFor="body" className="block text-sm font-medium mb-2">
          Body
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            if (errors.body) {
              setErrors({ ...errors, body: undefined })
            }
          }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[200px]"
          placeholder="What's on your mind? Remember, this post will disappear after 24 hours..."
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? 'body-error' : undefined}
          disabled={isLoading}
          maxLength={1000}
        />
        {errors.body && (
          <p id="body-error" className="mt-1 text-sm text-red-600">
            {errors.body}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {body.length}/1000 characters
        </p>
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : isEditing ? 'Update Post' : 'Publish Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}