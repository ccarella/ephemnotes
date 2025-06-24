'use client'

import { useState, FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/lib/toast'
import { signupSchema, validateForm, validateField } from '@/lib/formValidation'
import { TOUCH_TARGETS, SPACING, TYPOGRAPHY } from '@/lib/responsive'
import { getAuthErrorMessage } from '@/lib/authErrors'

type SignUpFormProps = {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { signUp, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loading = authLoading || isSubmitting

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validation = await validateForm(signupSchema, { email, password })
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }
    
    // Clear any existing errors
    setValidationErrors({})
    setIsSubmitting(true)

    try {
      await signUp(email, password)
      toast.success('Account created! Please check your email to verify your account.')
      
      // Clear form
      setEmail('')
      setPassword('')
      
      // Call success callback if provided
      onSuccess?.()
    } catch (error) {
      // Display error message from Supabase
      const errorMessage = error instanceof Error ? getAuthErrorMessage(error) : 'An error occurred during sign up'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = async (value: string) => {
    setEmail(value)
    
    // Clear error when user starts typing
    if (validationErrors.email) {
      const error = await validateField(signupSchema, 'email', value)
      setValidationErrors(prev => ({
        ...prev,
        email: error || ''
      }))
    }
  }

  const handlePasswordChange = async (value: string) => {
    setPassword(value)
    
    // Clear error when user starts typing
    if (validationErrors.password) {
      const error = await validateField(signupSchema, 'password', value)
      setValidationErrors(prev => ({
        ...prev,
        password: error || ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${SPACING.form.gap} animate-fade-in`} noValidate>
      <div className={SPACING.form.inputGap}>
        <label htmlFor="email" className={`block ${TYPOGRAPHY.label.base} text-gray-700 dark:text-gray-300`}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          disabled={loading}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          className={`w-full ${TOUCH_TARGETS.input} rounded-lg border ${
            validationErrors.email 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
          } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900 dark:text-white transition-all duration-150`}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {validationErrors.email && (
          <p 
            id="email-error" 
            className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600 dark:text-red-400 animate-fade-in`}
            role="alert"
            aria-live="polite"
          >
            {validationErrors.email}
          </p>
        )}
      </div>

      <div className={SPACING.form.inputGap}>
        <label htmlFor="password" className={`block ${TYPOGRAPHY.label.base} text-gray-700 dark:text-gray-300`}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          disabled={loading}
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
          className={`w-full ${TOUCH_TARGETS.input} rounded-lg border ${
            validationErrors.password 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
          } bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:focus:bg-gray-900 dark:text-white transition-all duration-150`}
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
        />
        {validationErrors.password && (
          <p 
            id="password-error" 
            className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600 dark:text-red-400 animate-fade-in`}
            role="alert"
            aria-live="polite"
          >
            {validationErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${TOUCH_TARGETS.button} py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600 ${TYPOGRAPHY.body.base} font-medium shadow-sm hover:shadow transition-all duration-150 transform hover:scale-[1.02]`}
        aria-describedby={loading ? 'loading-status' : undefined}
      >
        {loading ? (
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
            Creating account...
          </span>
        ) : (
          'Sign up'
        )}
      </button>
      
      {loading && (
        <span
          id="loading-status"
          className="sr-only"
          aria-live="polite"
        >
          Creating your account, please wait
        </span>
      )}
    </form>
  )
}