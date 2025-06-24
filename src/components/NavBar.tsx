'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { layout, typography, cn } from '@/lib/design-system'

export function NavBar() {
  const { user, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <>
      <nav role="navigation" className={layout.nav.container}>
        <div className={layout.nav.content}>
          {/* Logo - minimal text */}
          <Link
            href="/"
            className={cn(typography.ui.DEFAULT, 'font-medium text-foreground no-underline hover:opacity-70 transition-opacity')}
          >
            EphemNotes
          </Link>

          {/* Right side - minimal actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <span className={cn(typography.ui.small, 'text-muted')}>Loading...</span>
            ) : user ? (
              <>
                <Link
                  href="/posts/new"
                  className={cn(layout.nav.link, 'hidden sm:inline-block')}
                >
                  Write
                </Link>
                <Link
                  href="/posts"
                  className={cn(layout.nav.link, 'hidden sm:inline-block')}
                >
                  Posts
                </Link>
                <Link
                  href="/signout"
                  className={layout.nav.link}
                >
                  Sign out
                </Link>
              </>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className={cn(typography.ui.DEFAULT, 'text-secondary hover:text-foreground transition-colors')}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}