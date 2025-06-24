'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'

export function NetworkStatusProvider() {
  // This component exists solely to use the useNetworkStatus hook
  // at the app level to monitor network connectivity
  useNetworkStatus()

  return null
}

