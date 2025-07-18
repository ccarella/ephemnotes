'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { TOUCH_TARGETS, matchesBreakpoint } from '@/lib/responsive'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleMyPosts = () => {
    setIsOpen(false)
    router.push('/my-post')
  }

  const handleCreatePost = () => {
    setIsOpen(false)
    router.push('/new-post')
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const userEmail = user.email || ''
  const userInitial = userEmail.charAt(0).toUpperCase()

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && !matchesBreakpoint('sm')

  return (
    <div ref={menuRef} className="relative">
      <button
        data-testid="user-menu-trigger"
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-offset-2"
        style={{ width: '32px', height: '32px' }}
      >
        {avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt="User avatar"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span data-testid="avatar-fallback">{userInitial}</span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className={`absolute ${isMobile ? 'left-0 right-0 -ml-4' : 'right-0'} mt-2 ${isMobile ? 'w-screen' : 'w-56'} origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:right-0 sm:left-auto sm:ml-0 sm:w-56`}
        >
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm text-text-muted">Signed in as</p>
            <p className="text-sm font-medium text-text-primary truncate">
              {userEmail}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={handleCreatePost}
              className={`flex w-full items-center px-4 ${TOUCH_TARGETS.link} text-sm text-text-primary hover:bg-gray-100`}
              role="menuitem"
            >
              <svg
                className="mr-3 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Post
            </button>

            <button
              onClick={handleMyPosts}
              className={`flex w-full items-center px-4 ${TOUCH_TARGETS.link} text-sm text-text-primary hover:bg-gray-100`}
              role="menuitem"
            >
              <svg
                className="mr-3 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              My Posts
            </button>

            <button
              onClick={handleSignOut}
              className={`flex w-full items-center px-4 ${TOUCH_TARGETS.link} text-sm text-text-primary hover:bg-gray-100`}
              role="menuitem"
            >
              <svg
                className="mr-3 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}