import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, renderHook, waitFor } from '@testing-library/react'
import { ToastProvider, useToast } from './toast'
import type { ReactNode } from 'react'

// Remove the mock for this test file
vi.unmock('@/lib/toast')

describe('Toast Context and Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('ToastProvider', () => {
    it('provides toast context to children', () => {
      const TestComponent = () => {
        const { toast } = useToast()
        return (
          <button onClick={() => toast.success('Test message')}>
            Add Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders ToastContainer with toasts', () => {
      const TestComponent = () => {
        const { toast } = useToast()
        return (
          <button onClick={() => toast.success('Success message')}>
            Add Toast
          </button>
        )
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      act(() => {
        screen.getByRole('button').click()
      })

      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('supports custom position prop', () => {
      render(
        <ToastProvider position="top-left">
          <div>Test</div>
        </ToastProvider>
      )

      const container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('top-4')
      expect(container).toHaveClass('left-4')
    })

    it('supports custom duration prop', () => {
      const TestComponent = () => {
        const { toast } = useToast()
        return (
          <button onClick={() => toast.success('Test')}>
            Add Toast
          </button>
        )
      }

      render(
        <ToastProvider duration={2000}>
          <TestComponent />
        </ToastProvider>
      )

      act(() => {
        screen.getByRole('button').click()
      })

      act(() => {
        vi.advanceTimersByTime(2000)
      })

      waitFor(() => {
        expect(screen.queryByText('Test')).not.toBeInTheDocument()
      })
    })
  })

  describe('useToast hook', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    )

    it('throws error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useToast())
      }).toThrow('useToast must be used within a ToastProvider')
      
      consoleSpy.mockRestore()
    })

    it('provides toast.success method', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.success('Success message')
      })

      render(
        <ToastProvider>
          <div />
        </ToastProvider>
      )

      act(() => {
        result.current.toast.success('Success message')
      })
    })

    it('provides toast.error method', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.error('Error message')
      })

      render(
        <ToastProvider>
          <div />
        </ToastProvider>
      )

      act(() => {
        result.current.toast.error('Error message')
      })
    })

    it('provides toast.info method', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.info('Info message')
      })
    })

    it('provides toast.warning method', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.warning('Warning message')
      })
    })

    it('provides toast.dismiss method', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      let toastId: string
      act(() => {
        toastId = result.current.toast.success('Test message')
      })

      act(() => {
        result.current.toast.dismiss(toastId!)
      })

      // Toast should be removed
      expect(result.current.toasts).toHaveLength(0)
    })

    it('provides toast.dismissAll method', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.success('Toast 1')
        result.current.toast.error('Toast 2')
        result.current.toast.info('Toast 3')
      })

      expect(result.current.toasts).toHaveLength(3)

      act(() => {
        result.current.toast.dismissAll()
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('generates unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      let id1: string, id2: string
      act(() => {
        id1 = result.current.toast.success('Toast 1')
        id2 = result.current.toast.success('Toast 2')
      })

      expect(id1).not.toBe(id2)
    })

    it('supports custom duration per toast', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.success('Quick toast', { duration: 1000 })
      })

      expect(result.current.toasts[0].duration).toBe(1000)
    })

    it('supports duration: 0 for persistent toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.info('Persistent toast', { duration: 0 })
      })

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      // Toast should still be present
      expect(result.current.toasts).toHaveLength(1)
    })

    it('limits maximum number of toasts', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        // Add 6 toasts (max is 5 by default)
        for (let i = 0; i < 6; i++) {
          result.current.toast.info(`Toast ${i + 1}`)
        }
      })

      // Should only have 5 toasts
      expect(result.current.toasts).toHaveLength(5)
      // First toast should be removed
      expect(result.current.toasts[0].message).toBe('Toast 2')
    })

    it('provides custom toast method for custom types', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      act(() => {
        result.current.toast.custom('Custom message', { type: 'info' })
      })

      expect(result.current.toasts[0]).toMatchObject({
        message: 'Custom message',
        type: 'info'
      })
    })

    it('returns toast ID from all methods', () => {
      const { result } = renderHook(() => useToast(), { wrapper })

      let successId: string, errorId: string, infoId: string, warningId: string, customId: string

      act(() => {
        successId = result.current.toast.success('Success')
        errorId = result.current.toast.error('Error')
        infoId = result.current.toast.info('Info')
        warningId = result.current.toast.warning('Warning')
        customId = result.current.toast.custom('Custom', { type: 'info' })
      })

      expect(successId!).toBeTruthy()
      expect(errorId!).toBeTruthy()
      expect(infoId!).toBeTruthy()
      expect(warningId!).toBeTruthy()
      expect(customId!).toBeTruthy()
      expect(new Set([successId, errorId, infoId, warningId, customId]).size).toBe(5)
    })
  })

  describe('Integration', () => {
    it('renders toasts from multiple components', () => {
      const Component1 = () => {
        const { toast } = useToast()
        return <button onClick={() => toast.success('From Component 1')}>Component 1</button>
      }

      const Component2 = () => {
        const { toast } = useToast()
        return <button onClick={() => toast.error('From Component 2')}>Component 2</button>
      }

      render(
        <ToastProvider>
          <Component1 />
          <Component2 />
        </ToastProvider>
      )

      act(() => {
        screen.getByText('Component 1').click()
        screen.getByText('Component 2').click()
      })

      expect(screen.getByText('From Component 1')).toBeInTheDocument()
      expect(screen.getByText('From Component 2')).toBeInTheDocument()
    })

    it('handles rapid toast additions', () => {
      const TestComponent = () => {
        const { toast } = useToast()
        const addManyToasts = () => {
          for (let i = 0; i < 10; i++) {
            toast.info(`Toast ${i + 1}`)
          }
        }
        return <button onClick={addManyToasts}>Add Many</button>
      }

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      )

      act(() => {
        screen.getByText('Add Many').click()
      })

      // Should limit to 5 toasts
      const toasts = screen.getAllByRole('alert')
      expect(toasts).toHaveLength(5)
    })
  })
})