import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FarcasterSplash } from './FarcasterSplash'

vi.mock('@/lib/farcaster', () => ({
  initializeFarcasterSDK: vi.fn().mockResolvedValue(undefined),
}))

describe('FarcasterSplash', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render splash screen initially', () => {
    render(<FarcasterSplash />)
    
    expect(screen.getByTestId('farcaster-splash')).toBeInTheDocument()
    expect(screen.getByText('EphemNotes')).toBeInTheDocument()
  })

  it('should hide splash screen after SDK initialization', async () => {
    const { initializeFarcasterSDK } = await import('@/lib/farcaster')
    
    render(<FarcasterSplash />)
    
    expect(screen.getByTestId('farcaster-splash')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(initializeFarcasterSDK).toHaveBeenCalledOnce()
    })
    
    await waitFor(() => {
      expect(screen.queryByTestId('farcaster-splash')).not.toBeInTheDocument()
    })
  })

  it('should handle SDK initialization errors gracefully', async () => {
    const { initializeFarcasterSDK } = await import('@/lib/farcaster')
    vi.mocked(initializeFarcasterSDK).mockRejectedValueOnce(new Error('SDK error'))
    
    render(<FarcasterSplash />)
    
    await waitFor(() => {
      expect(screen.queryByTestId('farcaster-splash')).not.toBeInTheDocument()
    })
  })

  it('should display loading animation', () => {
    render(<FarcasterSplash />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})