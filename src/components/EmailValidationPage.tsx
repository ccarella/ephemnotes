'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface EmailValidationPageProps {
  email?: string
  onResend?: () => Promise<boolean>
}

export function EmailValidationPage({ email, onResend }: EmailValidationPageProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownSeconds])

  const handleResend = async () => {
    if (!onResend || cooldownSeconds > 0) return

    setIsResending(true)
    setResendStatus('idle')

    try {
      const success = await onResend()
      if (success) {
        setResendStatus('success')
        setCooldownSeconds(60) // 60 second cooldown
      } else {
        setResendStatus('error')
      }
    } catch {
      setResendStatus('error')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
          <p className="text-gray-600">We&apos;ve sent a verification email to:</p>
          {email && <p className="text-gray-900 font-medium break-words">{email}</p>}
        </div>

        <div className="space-y-4 text-gray-600">
          <p>
            Please check your inbox and click the verification link to complete your registration.
          </p>
          <p className="text-sm">Don&apos;t see the email? Check your spam folder or try resending.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleResend}
            disabled={isResending || cooldownSeconds > 0}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Resend verification email"
          >
            {isResending
              ? 'Sending...'
              : cooldownSeconds > 0
                ? `Resend in ${cooldownSeconds} seconds`
                : 'Resend Verification Email'}
          </button>

          <div aria-live="polite" className="min-h-[24px]">
            {resendStatus === 'success' && (
              <p className="text-green-600">Email sent successfully!</p>
            )}
            {resendStatus === 'error' && (
              <p className="text-red-600">Failed to send email. Please try again.</p>
            )}
          </div>
        </div>

        <div className="pt-6 space-y-2">
          <Link href="/login" className="block text-blue-600 hover:text-blue-700 underline">
            Back to Login
          </Link>
          <Link
            href="/support"
            className="block text-gray-600 hover:text-gray-700 underline text-sm"
          >
            Contact Support
          </Link>
        </div>

        <div className="sr-only">Verification email sent</div>
      </div>
    </main>
  )
}
