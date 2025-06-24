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

type AuthMode = 'signin' | 'signup' | 'magic-link'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const { signIn, signInWithMagicLink, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setEmail('')
      setPassword('')
      setValidationError(null)
      setMode('signin')
      setMagicLinkSent(false)
    }
  }, [isOpen])

  const validateEmail = () => {
    setValidationError(null)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email)) {
      setValidationError('Please enter a valid email')
      return false
    }
    return true
  }

  const validateForm = () => {
    if (!validateEmail()) return false

    // Password validation for signin mode
    if (mode === 'signin' && password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (mode === 'magic-link') {
      if (!validateEmail()) return

      try {
        await signInWithMagicLink(email.trim())
        setMagicLinkSent(true)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link'
        toast.error(errorMessage)
      }
    } else {
      if (!validateForm()) return

      try {
        await signIn(email, password)
        toast.success('Welcome back!')
        onClose()
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred during authentication'
        toast.error(errorMessage)
      }
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
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Magic Link Sign In'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`${TOUCH_TARGETS.iconButton} flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {magicLinkSent ? (
          <div className="text-center space-y-4">
            <div className="text-green-600 dark:text-green-400">
              <svg
                className="w-16 h-16 mx-auto mb-4"
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
            <h3 className={`${TYPOGRAPHY.heading.h4} text-gray-900 dark:text-white`}>
              Check your email!
            </h3>
            <p className={`${TYPOGRAPHY.body.base} text-gray-600 dark:text-gray-300`}>
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </p>
            <p className={`${TYPOGRAPHY.body.small} text-gray-500 dark:text-gray-400`}>
              Click the link in the email to sign in. The link will expire in 1 hour.
            </p>
            <button
              onClick={() => {
                setMagicLinkSent(false)
                setEmail('')
              }}
              className={`${TOUCH_TARGETS.button} px-6 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${TYPOGRAPHY.body.base}`}
            >
              Send another link
            </button>
          </div>
        ) : mode === 'signin' || mode === 'magic-link' ? (
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

            {mode === 'signin' && (
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
            )}

            {validationError && (
              <div
                className={`rounded-md bg-red-50 p-3 ${TYPOGRAPHY.body.small} text-red-600 dark:bg-red-900/20 dark:text-red-400`}
              >
                {validationError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${TOUCH_TARGETS.button} rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 ${TYPOGRAPHY.body.base}`}
            >
              {loading
                ? mode === 'magic-link'
                  ? 'Sending...'
                  : 'Loading...'
                : mode === 'magic-link'
                  ? 'Send Magic Link'
                  : 'Sign In'}
            </button>
          </form>
        ) : (
          <SignUpForm onSuccess={handleSignUpSuccess} />
        )}

        {!magicLinkSent && (
          <>
            {mode !== 'magic-link' && mode === 'signin' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('magic-link')}
                  className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                >
                  Sign in with magic link
                </button>
              </div>
            )}

            {mode === 'magic-link' && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                >
                  Sign in with password
                </button>
              </div>
            )}

            <div className={`mt-6 text-center ${TYPOGRAPHY.body.base}`}>
              {mode === 'signin' || mode === 'magic-link' ? (
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
          </>
        )}
      </div>
    </div>
  )
}

