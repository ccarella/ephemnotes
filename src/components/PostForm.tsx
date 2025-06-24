'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/toast'

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
  const { toast } = useToast()
  const [title, setTitle] = useState(initialData?.title || '')
  const [body, setBody] = useState(initialData?.body || '')
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

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
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      await onSubmit({ title: title.trim(), body: body.trim() })
      // Show success toast
      toast.success(isEditing ? 'Post updated successfully!' : 'Post created successfully!')
      // Reset form if creating a new post
      if (!isEditing) {
        setTitle('')
        setBody('')
      }
    } catch (error) {
      // Show error toast with the actual error message
      toast.error(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" style={{ maxWidth: '720px' }}>
      <div>
        <label htmlFor="title" className="block text-body-sm font-medium text-text-primary mb-2">
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
          className="w-full bg-white border border-ui-grey focus:border-ui-grey focus:outline-none focus:ring-0"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '20px',
            fontStyle: title ? 'normal' : 'italic',
            color: title ? 'var(--text-primary)' : '#777777'
          }}
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
      </div>
      
      <div className="relative" style={{ marginTop: '24px' }}>
        <label htmlFor="body" className="block text-body-sm font-medium text-text-primary mb-2">
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
          className="w-full bg-white border border-ui-grey focus:border-ui-grey focus:outline-none focus:ring-0 font-mono resize-none"
          style={{
            padding: '24px 16px',
            borderRadius: '8px',
            height: '320px',
            fontSize: '20px',
            lineHeight: '1.5',
            fontStyle: body ? 'normal' : 'italic',
            color: body ? 'var(--text-primary)' : '#777777'
          }}
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
        <p className="absolute bottom-2 right-2 text-micro text-text-primary" style={{ padding: '8px' }}>
          {body.length}/1000
        </p>
      </div>
      
      <div className="flex gap-6" style={{ marginTop: '40px' }}>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-brand-blue text-white text-caption font-semibold hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          style={{
            minWidth: '120px',
            height: '48px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.25px'
          }}
        >
          {isLoading ? 'LOADING...' : isEditing ? 'UPDATE' : 'PUBLISH'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="bg-gray-50 text-text-primary border border-ui-grey hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          style={{
            minWidth: '120px',
            height: '48px',
            borderRadius: '4px',
            backgroundColor: '#F5F5F5',
            color: '#333333',
            fontWeight: 600,
            fontSize: '16px'
          }}
        >
          CANCEL
        </button>
      </div>
    </form>
  )
}