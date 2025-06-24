import { sdk } from '@farcaster/frame-sdk'

export async function initializeFarcasterSDK(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  try {
    await sdk.actions.ready()
  } catch (error) {
    console.error('Failed to initialize Farcaster SDK:', error)
  }
}