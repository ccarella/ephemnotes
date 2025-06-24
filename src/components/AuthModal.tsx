'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/lib/toast'
import { MODAL, TOUCH_TARGETS, SPACING, TYPOGRAPHY } from '@/lib/responsive'
import { SignUpForm } from './SignUpForm'
import { useRouter } from 'next/navigation'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const { signIn, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setEmail('')
      setPassword('')
      setValidationError(null)
      setMode('signin')
    }
  }, [isOpen])

  const validateForm = () => {
    setValidationError(null)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email')
      return false
    }

    // Password validation
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      onClose()
    } catch (error) {
      // Display error message from Supabase
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during authentication'
      toast.error(errorMessage)
    }
  }

  const handleSignUpSuccess = () => {
    onClose()
    router.push(`/email-validation?email=${encodeURIComponent(email)}`)
  }

  if (!isOpen) return null

  return (
    <div
      className={`${MODAL.overlay} flex items-center justify-center p-4 sm:p-6`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`${MODAL.content.fullMobile} rounded-none sm:rounded-lg bg-white ${MODAL.padding} shadow-lg dark:bg-gray-800`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="auth-modal-title" className={TYPOGRAPHY.heading.h3}>
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`${TOUCH_TARGETS.iconButton} flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={handleSubmit} className={SPACING.form.gap}>
            <div className={SPACING.form.inputGap}>
            <label htmlFor="email" className={`block ${TYPOGRAPHY.label.base}`}>
              Email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className={`w-full ${TOUCH_TARGETS.input} rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              placeholder="Enter your email"
            />
          </div>

          <div className={SPACING.form.inputGap}>
            <label htmlFor="password" className={`block ${TYPOGRAPHY.label.base}`}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full ${TOUCH_TARGETS.input} rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              placeholder="Enter your password"
            />
          </div>

          {validationError && (
            <div className={`rounded-md bg-red-50 p-3 ${TYPOGRAPHY.body.small} text-red-600 dark:bg-red-900/20 dark:text-red-400`}>
              {validationError}
            </div>
          )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${TOUCH_TARGETS.button} rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 ${TYPOGRAPHY.body.base}`}
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <SignUpForm onSuccess={handleSignUpSuccess} />
        )}

        <div className={`mt-6 text-center ${TYPOGRAPHY.body.base}`}>
          {mode === 'signin' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}