'use client'

import { useEffect, useState } from 'react'
import { initializeFarcasterSDK } from '@/lib/farcaster'

export function FarcasterSplash() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initSDK = async () => {
      try {
        await initializeFarcasterSDK()
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initSDK()
  }, [])

  if (!isLoading) {
    return null
  }

  return (
    <div
      data-testid="farcaster-splash"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center space-y-6">
        <h1 className="text-4xl font-bold text-foreground">EphemNotes</h1>
        <div
          data-testid="loading-spinner"
          className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground"
        />
      </div>
    </div>
  )
}