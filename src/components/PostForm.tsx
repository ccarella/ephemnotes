'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TOUCH_TARGETS, SPACING, TYPOGRAPHY, LAYOUT } from '@/lib/responsive'
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
    <form onSubmit={handleSubmit} className={SPACING.form.gap}>
      <div className={SPACING.form.inputGap}>
        <label htmlFor="title" className={`block ${TYPOGRAPHY.label.base} mb-2`}>
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
          className={`w-full rounded-md border border-gray-300 ${TOUCH_TARGETS.input} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="Enter your post title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          disabled={isLoading}
          maxLength={100}
        />
        {errors.title && (
          <p id="title-error" className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600`}>
            {errors.title}
          </p>
        )}
        <p className={`mt-1 ${TYPOGRAPHY.body.small} text-gray-500`}>
          {title.length}/100 characters
        </p>
      </div>
      
      <div className={SPACING.form.inputGap}>
        <label htmlFor="body" className={`block ${TYPOGRAPHY.label.base} mb-2`}>
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
          className={`w-full rounded-md border border-gray-300 ${TOUCH_TARGETS.textarea} focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[150px] sm:min-h-[200px]`}
          placeholder="What's on your mind? Remember, this post will disappear after 24 hours..."
          aria-invalid={!!errors.body}
          aria-describedby={errors.body ? 'body-error' : undefined}
          disabled={isLoading}
          maxLength={1000}
        />
        {errors.body && (
          <p id="body-error" className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600`}>
            {errors.body}
          </p>
        )}
        <p className={`mt-1 ${TYPOGRAPHY.body.small} text-gray-500`}>
          {body.length}/1000 characters
        </p>
      </div>
      
      <div className={`${LAYOUT.responsiveRow} ${SPACING.component.gapSmall} w-full sm:w-auto`}>
        <button
          type="submit"
          disabled={isLoading}
          className={`${TOUCH_TARGETS.button} ${TYPOGRAPHY.body.base} rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
        >
          {isLoading ? 'Loading...' : isEditing ? 'Update Post' : 'Publish Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className={`${TOUCH_TARGETS.button} ${TYPOGRAPHY.body.base} rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto`}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}