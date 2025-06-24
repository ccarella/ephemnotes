'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { AuthModal } from './AuthModal'
import { UserMenu } from './UserMenu'
import { SkeletonAvatar } from './Skeleton'
import { SPACING } from '@/lib/responsive'

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
        className="sticky top-0 z-40 w-full bg-white border-b border-border-grey"
        style={{ height: '64px' }}
      >
        <div className="h-full">
          <div
            data-testid="navbar-container"
            className="h-full flex items-center justify-between px-6"
          >
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-brand-blue font-semibold text-lg hover:opacity-80 transition-opacity"
                style={{ fontFamily: 'var(--font-ui-sans)', fontWeight: 600 }}
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
                  className="bg-brand-blue text-white text-sm font-semibold hover:bg-blue-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2"
                  style={{ 
                    padding: '8px 18px',
                    borderRadius: '12px',
                    lineHeight: '18px'
                  }}
                >
                  New Post
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-primary hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2"
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
            <div className="absolute left-0 right-0 top-16 bg-white border-t border-border-grey animate-fade-in md:hidden">
              <div className={`${SPACING.component.padding} ${SPACING.component.gap} flex flex-col`}>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <SkeletonAvatar size="sm" />
                  </div>
                ) : user ? (
                  <div className="border-t border-border pt-4">
                    <UserMenu />
                  </div>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-brand-blue text-white text-sm font-semibold hover:bg-blue-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2"
                    style={{ 
                      padding: '8px 18px',
                      borderRadius: '12px',
                      lineHeight: '18px'
                    }}
                  >
                    New Post
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