'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/lib/toast'

interface SignInFormProps {
  className?: string
  buttonText?: string
  loadingText?: string
  onSuccess?: () => void
}

export function SignInForm({
  className = '',
  buttonText = 'Send Magic Link',
  loadingText = 'Sending...',
  onSuccess,
}: SignInFormProps) {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string }>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // Clear email error when user starts typing a valid email
    if (errors.email && (value === '' || validateEmail(value))) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading) return

    const trimmedEmail = email.trim()
    
    // Validation
    if (!trimmedEmail) {
      setErrors({ email: 'Email is required' })
      return
    }
    
    if (!validateEmail(trimmedEmail)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await signInWithMagicLink(trimmedEmail)
      toast.success(`Magic link sent to ${trimmedEmail}`)
      setEmail('')
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as React.FormEvent)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-4 ${className}`}
      noValidate
    >
      <div className="space-y-2">
        <label 
          htmlFor="email" 
          className="block text-sm font-medium text-foreground"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter your email"
          autoComplete="email"
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`
            w-full px-3 py-2 border rounded-md
            bg-background text-foreground
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.email ? 'border-red-500' : 'border-border'}
          `}
        />
        {errors.email && (
          <p 
            id="email-error" 
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {errors.email}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full py-2 px-4 rounded-md font-medium
          bg-primary text-primary-foreground
          hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        `}
        aria-describedby={isLoading ? 'loading-status' : undefined}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText}
          </span>
        ) : (
          buttonText
        )}
      </button>

      {isLoading && (
        <span
          id="loading-status"
          className="sr-only"
          aria-live="polite"
        >
          Sending magic link, please wait
        </span>
      )}
    </form>
  )
}