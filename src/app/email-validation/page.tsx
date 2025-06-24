'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { EmailValidationPage } from '@/components/EmailValidationPage'
import { useSupabase } from '@/providers/supabase-provider'

function EmailValidationContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const { supabase } = useSupabase()

  const handleResend = async () => {
    try {
      if (!email || !supabase) {
        throw new Error('No email address provided or Supabase not initialized')
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

export default function EmailValidation() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailValidationContent />
    </Suspense>
  )
}