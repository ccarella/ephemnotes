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
    <form onSubmit={handleSubmit} className={SPACING.form.gap} noValidate>
      <div className={SPACING.form.inputGap}>
        <label htmlFor="email" className={`block ${TYPOGRAPHY.label.base}`}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          disabled={loading}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          className={`w-full ${TOUCH_TARGETS.input} rounded-md border ${
            validationErrors.email 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-1 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="you@example.com"
        />
        {validationErrors.email && (
          <p 
            id="email-error" 
            className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600 dark:text-red-400`}
            role="alert"
          >
            {validationErrors.email}
          </p>
        )}
      </div>

      <div className={SPACING.form.inputGap}>
        <label htmlFor="password" className={`block ${TYPOGRAPHY.label.base}`}>
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
          className={`w-full ${TOUCH_TARGETS.input} rounded-md border ${
            validationErrors.password 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-1 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Minimum 6 characters"
        />
        {validationErrors.password && (
          <p 
            id="password-error" 
            className={`mt-1 ${TYPOGRAPHY.body.small} text-red-600 dark:text-red-400`}
            role="alert"
          >
            {validationErrors.password}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${TOUCH_TARGETS.button} rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 ${TYPOGRAPHY.body.base}`}
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}