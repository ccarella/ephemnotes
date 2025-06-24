import { Metadata } from 'next'
import { SignInForm } from '@/components/SignInForm'

export const metadata: Metadata = {
  title: 'Sign In - EphemNotes',
  description: 'Sign in to your EphemNotes account using magic link authentication. No password required.',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a magic link to sign in instantly. 
            No password required.
          </p>
        </div>
        
        <div className="mt-8">
          <SignInForm className="space-y-6" />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            The magic link will expire in 1 hour for security.
          </p>
        </div>
      </div>
    </div>
  )
}