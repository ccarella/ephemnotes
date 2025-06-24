import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNetworkStatus } from './useNetworkStatus'
import type { ReactNode } from 'react'
import { ToastProvider } from '@/lib/toast'

// Create mock toast functions
const mockToastInfo = vi.fn()
const mockToastSuccess = vi.fn()

// Mock the toast hook
vi.mock('@/lib/toast', () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => children,
  useToast: () => ({
    toast: {
      info: mockToastInfo,
      success: mockToastSuccess,
      error: vi.fn(),
      warning: vi.fn(),
      custom: vi.fn(),
      dismiss: vi.fn(),
      dismissAll: vi.fn(),
    },
    toasts: [],
  }),
}))

describe('useNetworkStatus', () => {
  let originalNavigatorOnline: PropertyDescriptor | undefined
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  )

  beforeEach(() => {
    // Save original descriptor
    originalNavigatorOnline = Object.getOwnPropertyDescriptor(window.navigator, 'onLine')

    // Mock navigator.onLine
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })

    // Spy on event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    // Restore original descriptor
    if (originalNavigatorOnline) {
      Object.defineProperty(window.navigator, 'onLine', originalNavigatorOnline)
    }

    // Clear spies
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
    vi.clearAllMocks()

    // Clear mock toast functions
    mockToastInfo.mockClear()
    mockToastSuccess.mockClear()
  })

  it('should return initial online status', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    })

    const { result } = renderHook(() => useNetworkStatus(), { wrapper })

    expect(result.current.isOnline).toBe(true)
  })

  it('should return initial offline status', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() => useNetworkStatus(), { wrapper })

    expect(result.current.isOnline).toBe(false)
  })

  it('should add event listeners on mount', () => {
    renderHook(() => useNetworkStatus(), { wrapper })

    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useNetworkStatus(), { wrapper })

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })

  it('should update status when going offline', async () => {
    const { result } = renderHook(() => useNetworkStatus(), { wrapper })

    expect(result.current.isOnline).toBe(true)

    // Simulate going offline
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(result.current.isOnline).toBe(false)
  })

  it('should update status when going online', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    const { result } = renderHook(() => useNetworkStatus(), { wrapper })

    expect(result.current.isOnline).toBe(false)

    // Simulate going online
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      })
      window.dispatchEvent(new Event('online'))
    })

    expect(result.current.isOnline).toBe(true)
  })

  it('should show toast when going offline', () => {
    renderHook(() => useNetworkStatus(), { wrapper })

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })

    expect(mockToastInfo).toHaveBeenCalledWith("You're offline. Some features may be limited.")
  })

  it('should show toast when coming back online', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    })

    renderHook(() => useNetworkStatus(), { wrapper })

    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      })
      window.dispatchEvent(new Event('online'))
    })

    expect(mockToastSuccess).toHaveBeenCalledWith("You're back online!")
  })

  it('should handle multiple status changes', () => {
    const { result } = renderHook(() => useNetworkStatus(), { wrapper })

    // Start online
    expect(result.current.isOnline).toBe(true)

    // Go offline
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current.isOnline).toBe(false)

    // Go online again
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: true,
      })
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current.isOnline).toBe(true)

    // Go offline again
    act(() => {
      Object.defineProperty(window.navigator, 'onLine', {
        writable: true,
        configurable: true,
        value: false,
      })
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current.isOnline).toBe(false)
  })
})

