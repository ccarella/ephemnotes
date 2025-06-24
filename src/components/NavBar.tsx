'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { UserMenu } from './UserMenu'

export function NavBar() {
  const { user, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <>
      <nav
        role="navigation"
        className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            data-testid="navbar-container"
            className="flex h-16 items-center justify-between"
          >
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                EphemNotes
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {loading ? (
                <div data-testid="navbar-loading" className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              ) : user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Sign In
                </button>
              )}
            </div>
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