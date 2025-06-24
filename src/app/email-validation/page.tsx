'use client'

import { useSearchParams } from 'next/navigation'
import { EmailValidationPage } from '@/components/EmailValidationPage'
import { createClient } from '@/lib/supabase'

export default function EmailValidation() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const supabase = createClient()

  const handleResend = async () => {
    try {
      if (!email) {
        throw new Error('No email address provided')
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to resend verification email:', error)
      return false
    }
  }

  return <EmailValidationPage email={email || undefined} onResend={handleResend} />
}
