'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/lib/toast'
import { TOUCH_TARGETS, SPACING, TYPOGRAPHY } from '@/lib/responsive'

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
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [magicLinkSent, setMagicLinkSent] = useState(false)

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
      setMagicLinkSent(true)
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

  if (magicLinkSent) {
    return (
      <div className={`text-center space-y-6 py-8 animate-fade-in ${className}`}>
        <div className="text-green-500 dark:text-green-400">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className={`${TYPOGRAPHY.heading.h3} text-gray-900 dark:text-white`}>
            Check your inbox
          </h3>
          <p className={`${TYPOGRAPHY.body.base} text-gray-600 dark:text-gray-400`}>
            We sent a magic link to
          </p>
          <p className={`${TYPOGRAPHY.body.base} font-medium text-gray-900 dark:text-white`}>
            {email}
          </p>
        </div>
        <p className={`${TYPOGRAPHY.body.small} text-gray-500 dark:text-gray-500 max-w-sm mx-auto`}>
          Click the link in your email to sign in. The link expires in 1 hour.
        </p>
        <button
          onClick={() => {
            setMagicLinkSent(false)
            setEmail('')
          }}
          className={`${TOUCH_TARGETS.button} px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${TYPOGRAPHY.body.base} font-medium transition-colors duration-150`}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`${SPACING.form.gap} ${className}`}
      noValidate
    >
      <div className={SPACING.form.inputGap}>
        <label 
          htmlFor="email" 
          className={`block ${TYPOGRAPHY.label.base} text-gray-700 dark:text-gray-300`}
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={`w-full ${TOUCH_TARGETS.input} rounded-lg border ${
            errors.email 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
          } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900 dark:text-white transition-all duration-150`}
        />
        {errors.email && (
          <p 
            id="email-error" 
            className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600 dark:text-red-400`}
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
        className={`w-full ${TOUCH_TARGETS.button} py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 ${TYPOGRAPHY.body.base} font-medium shadow-sm hover:shadow transition-all duration-150 transform hover:scale-[1.02]`}
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