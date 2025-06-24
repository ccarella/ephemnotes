import { Metadata } from 'next'
import { SignInForm } from '@/components/SignInForm'
import { typography, spacing, cn } from '@/lib/design-system'

export const metadata: Metadata = {
  title: 'Sign In - EphemNotes',
  description: 'Sign in to your EphemNotes account using magic link authentication. No password required.',
}

export default function SignInPage() {
  return (
    <div className={spacing.stack.lg}>
      <div className="text-center">
        <h1 className={typography.h1}>
          Sign In
        </h1>
        <p className={cn(typography.body.small, 'text-secondary mt-2')}>
          Enter your email and we&apos;ll send you a magic link
        </p>
      </div>
      
      <SignInForm />
      
      <p className={cn(typography.ui.small, 'text-muted text-center')}>
        The magic link will expire in 1 hour
      </p>
    </div>
  )
}