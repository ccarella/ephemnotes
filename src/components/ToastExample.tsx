'use client'

import { useToast } from '@/lib/toast'

export function ToastExample() {
  const { toast } = useToast()

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => toast.success('Post successfully created!')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
      >
        Success Toast
      </button>
      <button
        onClick={() => toast.error('Failed to save post. Please try again.')}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Error Toast
      </button>
      <button
        onClick={() => toast.info('New posts are available. Refresh to see them.')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Info Toast
      </button>
      <button
        onClick={() => toast.warning('Your session will expire in 5 minutes.')}
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
      >
        Warning Toast
      </button>
      <button
        onClick={() => {
          toast.info('This toast will stay until dismissed', { duration: 0 })
        }}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
      >
        Persistent Toast
      </button>
      <button
        onClick={() => {
          toast.success('Quick toast!', { duration: 2000 })
        }}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
      >
        Quick Toast (2s)
      </button>
    </div>
  )
}