'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { UserMenu } from './UserMenu'
import { SkeletonAvatar } from './Skeleton'
import { NAVIGATION, SPACING, TOUCH_TARGETS } from '@/lib/responsive'

export function NavBar() {
  const { user, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignIn = () => {
    setAuthModalOpen(true)
    setMobileMenuOpen(false)
  }

  return (
    <>
      <nav
        role="navigation"
        className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80"
      >
        <div className={`${SPACING.container.maxWidth} ${SPACING.container.padding}`}>
          <div
            data-testid="navbar-container"
            className={NAVIGATION.container}
          >
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className={`${NAVIGATION.logo} text-gray-900 dark:text-white`}
              >
                EphemNotes
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className={NAVIGATION.desktopMenu}>
              {loading ? (
                <div data-testid="navbar-loading">
                  <SkeletonAvatar size="sm" />
                </div>
              ) : user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={handleSignIn}
                  className={`${TOUCH_TARGETS.button} rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600`}
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${NAVIGATION.mobileMenu.button} rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`${NAVIGATION.mobileMenu.menu} bg-white dark:bg-gray-900`}>
              <div className={`${SPACING.component.padding} ${SPACING.component.gap} flex flex-col`}>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <SkeletonAvatar size="sm" />
                  </div>
                ) : user ? (
                  <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                    <UserMenu />
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className={`${TOUCH_TARGETS.button} w-full rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600`}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}