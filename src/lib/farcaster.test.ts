import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initializeFarcasterSDK } from './farcaster'

vi.mock('@farcaster/frame-sdk', () => ({
  sdk: {
    actions: {
      ready: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

describe('Farcaster SDK Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call sdk.actions.ready when initialized', async () => {
    const { sdk } = await import('@farcaster/frame-sdk')
    
    await initializeFarcasterSDK()
    
    expect(sdk.actions.ready).toHaveBeenCalledOnce()
  })

  it('should handle errors gracefully when SDK fails to initialize', async () => {
    const { sdk } = await import('@farcaster/frame-sdk')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    sdk.actions.ready = vi.fn().mockRejectedValueOnce(new Error('SDK initialization failed'))
    
    await initializeFarcasterSDK()
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize Farcaster SDK:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should not call SDK methods if not in Farcaster environment', async () => {
    const originalWindow = global.window
    global.window = undefined as unknown as Window & typeof globalThis
    
    const { sdk } = await import('@farcaster/frame-sdk')
    
    await initializeFarcasterSDK()
    
    expect(sdk.actions.ready).not.toHaveBeenCalled()
    
    global.window = originalWindow
  })
})