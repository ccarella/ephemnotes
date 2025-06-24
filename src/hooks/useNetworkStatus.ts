'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/lib/toast'

interface UseNetworkStatusReturn {
  isOnline: boolean
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isOnline, setIsOnline] = useState(() => {
    // Return true on server-side and during hydration
    if (typeof window === 'undefined') {
      return true
    }
    return window.navigator.onLine
  })
  const { toast } = useToast()

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    toast.success("You're back online!")
  }, [toast])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    toast.info("You're offline. Some features may be limited.")
  }, [toast])

  useEffect(() => {
    // Update the initial state after hydration
    setIsOnline(window.navigator.onLine)

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline }
}

