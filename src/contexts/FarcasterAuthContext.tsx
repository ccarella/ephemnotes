'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { isInFarcasterFrame, getQuickAuthToken, getFarcasterContext } from '@/lib/farcaster-auth'

interface FarcasterUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
}

interface FarcasterAuthContextType extends ReturnType<typeof useAuth> {
  isInFrame: boolean
  farcasterUser: FarcasterUser | null
  authenticateWithQuickAuth: () => Promise<void>
  authenticateWithSIWF: (message: string, signature: string) => Promise<void>
}

const FarcasterAuthContext = createContext<FarcasterAuthContextType | undefined>(undefined)

export function FarcasterAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const [isInFrame, setIsInFrame] = useState(false)
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if we're in a Farcaster frame on mount
  useEffect(() => {
    const inFrame = isInFarcasterFrame()
    setIsInFrame(inFrame)
    
    if (inFrame) {
      // Get Farcaster context
      const context = getFarcasterContext()
      if (context?.user) {
        setFarcasterUser({
          fid: context.user.fid,
          username: context.user.username,
          displayName: context.user.displayName,
          pfpUrl: context.user.pfpUrl
        })
      }
    }
  }, [])

  const authenticateWithQuickAuth = useCallback(async () => {
    if (!isInFrame) {
      throw new Error('Not in Farcaster frame')
    }

    setLoading(true)
    setError(null)

    try {
      // Get auth token from Farcaster
      const { token } = await getQuickAuthToken()
      
      // Send to our API
      const response = await fetch('/api/auth/farcaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type: 'quick' })
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      await response.json()
      
      // The API should handle creating the session
      // Auth context will update automatically via onAuthStateChange
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Quick auth failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [isInFrame])

  const authenticateWithSIWF = useCallback(async (message: string, signature: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/farcaster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature, type: 'siwf' })
      })

      if (!response.ok) {
        throw new Error('Authentication failed')
      }

      await response.json()
      
      // The API should handle creating the session
    } catch (err) {
      const message = err instanceof Error ? err.message : 'SIWF authentication failed'
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const value: FarcasterAuthContextType = {
    ...auth,
    isInFrame,
    farcasterUser,
    loading: auth.loading || loading,
    error: auth.error || (error ? new Error(error) : null),
    authenticateWithQuickAuth,
    authenticateWithSIWF
  }

  return (
    <FarcasterAuthContext.Provider value={value}>
      {children}
    </FarcasterAuthContext.Provider>
  )
}

export function useFarcasterAuth() {
  const context = useContext(FarcasterAuthContext)
  if (context === undefined) {
    throw new Error('useFarcasterAuth must be used within a FarcasterAuthProvider')
  }
  
  // Provide convenience methods that match the expected API
  return {
    ...context,
    quickAuth: context.authenticateWithQuickAuth,
    signInWithFarcaster: async () => {
      // For now, we'll use a mock implementation
      // In a real implementation, this would handle the full SIWF flow
      const message = 'Sign in to EphemNotes'
      const signature = '0x...' // This would come from the user's wallet
      return context.authenticateWithSIWF(message, signature)
    },
    isInFarcasterFrame: context.isInFrame
  }
}