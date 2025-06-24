'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useFarcasterAuth } from '@/contexts/FarcasterAuthContext'
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
  const { quickAuth, signInWithFarcaster, isInFarcasterFrame, loading: farcasterLoading } = useFarcasterAuth()
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
      className={`${MODAL.overlay} flex items-center justify-center p-4 sm:p-6 animate-fade-in`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className={`${MODAL.content.fullMobile} rounded-none sm:rounded-2xl bg-white ${MODAL.padding} shadow-2xl dark:bg-gray-900 transform transition-all duration-200 ease-out scale-100`}
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 id="auth-modal-title" className={`${TYPOGRAPHY.heading.h2} text-gray-900 dark:text-white`}>
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Magic link'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`${TOUCH_TARGETS.iconButton} flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-150`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {magicLinkSent ? (
          <div className="text-center space-y-6 py-8 animate-fade-in">
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
        ) : mode === 'signin' || mode === 'magic-link' ? (
          <form onSubmit={handleSubmit} className={SPACING.form.gap}>
            <div className={SPACING.form.inputGap}>
              <label htmlFor="email" className={`block ${TYPOGRAPHY.label.base} text-gray-700 dark:text-gray-300`}>
                Email address
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={`w-full ${TOUCH_TARGETS.input} rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900 dark:text-white transition-all duration-150`}
                placeholder="you@example.com"
              />
            </div>

            {mode === 'signin' && (
              <div className={SPACING.form.inputGap}>
                <label htmlFor="password" className={`block ${TYPOGRAPHY.label.base} text-gray-700 dark:text-gray-300`}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={`w-full ${TOUCH_TARGETS.input} rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900 dark:text-white transition-all duration-150`}
                  placeholder="••••••••"
                />
              </div>
            )}

            {validationError && (
              <div
                className={`rounded-lg bg-red-50 border border-red-200 p-3.5 ${TYPOGRAPHY.body.small} text-red-600 dark:bg-red-900/10 dark:border-red-900/20 dark:text-red-400 animate-fade-in`}
              >
                {validationError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${TOUCH_TARGETS.button} py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 ${TYPOGRAPHY.body.base} font-medium shadow-sm hover:shadow transition-all duration-150 transform hover:scale-[1.02]`}
            >
              {loading
                ? mode === 'magic-link'
                  ? 'Sending...'
                  : 'Signing in...'
                : mode === 'magic-link'
                  ? 'Send magic link'
                  : 'Sign in'}
            </button>
          </form>
        ) : (
          <SignUpForm onSuccess={handleSignUpSuccess} />
        )}

        {/* Farcaster Authentication */}
        {!magicLinkSent && mode === 'signin' && (
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              {isInFarcasterFrame ? (
                <button
                  onClick={async () => {
                    try {
                      await quickAuth()
                      toast.success('Welcome back!')
                      onClose()
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
                      toast.error(errorMessage)
                    }
                  }}
                  disabled={farcasterLoading}
                  className={`w-full ${TOUCH_TARGETS.button} py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600 ${TYPOGRAPHY.body.base} font-medium flex items-center justify-center shadow-sm hover:shadow transition-all duration-150 transform hover:scale-[1.02]`}
                >
                  {farcasterLoading ? (
                    'Authenticating...'
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.24 7.17L12 0.93 5.76 7.17c-1.42 1.42-1.42 3.73 0 5.15l4.59 4.59c0.92 0.92 2.38 0.92 3.3 0l4.59-4.59c1.42-1.42 1.42-3.73 0-5.15zm-6.24 9.66L7.41 12.24c-0.78-0.78-0.78-2.05 0-2.83L12 4.83l4.59 4.58c0.78 0.78 0.78 2.05 0 2.83L12 16.83z"/>
                      </svg>
                      Quick Auth with Farcaster
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await signInWithFarcaster()
                      toast.success('Welcome back!')
                      onClose()
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
                      toast.error(errorMessage)
                    }
                  }}
                  disabled={farcasterLoading}
                  className={`w-full ${TOUCH_TARGETS.button} py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-500 dark:hover:bg-purple-600 ${TYPOGRAPHY.body.base} font-medium flex items-center justify-center shadow-sm hover:shadow transition-all duration-150 transform hover:scale-[1.02]`}
                >
                  {farcasterLoading ? (
                    'Authenticating...'
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.24 7.17L12 0.93 5.76 7.17c-1.42 1.42-1.42 3.73 0 5.15l4.59 4.59c0.92 0.92 2.38 0.92 3.3 0l4.59-4.59c1.42-1.42 1.42-3.73 0-5.15zm-6.24 9.66L7.41 12.24c-0.78-0.78-0.78-2.05 0-2.83L12 4.83l4.59 4.58c0.78 0.78 0.78 2.05 0 2.83L12 16.83z"/>
                      </svg>
                      Sign in with Farcaster
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {!magicLinkSent && (
          <>
            {mode !== 'magic-link' && mode === 'signin' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('magic-link')}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-150"
                >
                  Sign in with magic link
                </button>
              </div>
            )}

            {mode === 'magic-link' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-150"
                >
                  Sign in with password
                </button>
              </div>
            )}

            <div className={`mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center ${TYPOGRAPHY.body.sm}`}>
              {mode === 'signin' || mode === 'magic-link' ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-150"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-150"
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

