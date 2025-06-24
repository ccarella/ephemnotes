import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { Toast, ToastContainer } from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Toast Component', () => {
    it('renders toast message correctly', () => {
      render(<Toast id="1" type="success" message="Success message" onDismiss={() => {}} />)
      
      expect(screen.getByText('Success message')).toBeInTheDocument()
    })

    it('renders different toast types with correct styling', () => {
      const { rerender } = render(
        <Toast id="1" type="success" message="Success" onDismiss={() => {}} />
      )
      
      let toast = screen.getByRole('alert')
      expect(toast).toHaveClass('border-green-500')
      expect(toast).toHaveClass('bg-green-50')
      
      rerender(<Toast id="2" type="error" message="Error" onDismiss={() => {}} />)
      toast = screen.getByRole('alert')
      expect(toast).toHaveClass('border-red-500')
      expect(toast).toHaveClass('bg-red-50')
      
      rerender(<Toast id="3" type="info" message="Info" onDismiss={() => {}} />)
      toast = screen.getByRole('alert')
      expect(toast).toHaveClass('border-blue-500')
      expect(toast).toHaveClass('bg-blue-50')
      
      rerender(<Toast id="4" type="warning" message="Warning" onDismiss={() => {}} />)
      toast = screen.getByRole('alert')
      expect(toast).toHaveClass('border-yellow-500')
      expect(toast).toHaveClass('bg-yellow-50')
    })

    it('renders correct icons for each type', () => {
      const { rerender } = render(
        <Toast id="1" type="success" message="Success" onDismiss={() => {}} />
      )
      
      expect(screen.getByTestId('toast-icon-success')).toBeInTheDocument()
      
      rerender(<Toast id="2" type="error" message="Error" onDismiss={() => {}} />)
      expect(screen.getByTestId('toast-icon-error')).toBeInTheDocument()
      
      rerender(<Toast id="3" type="info" message="Info" onDismiss={() => {}} />)
      expect(screen.getByTestId('toast-icon-info')).toBeInTheDocument()
      
      rerender(<Toast id="4" type="warning" message="Warning" onDismiss={() => {}} />)
      expect(screen.getByTestId('toast-icon-warning')).toBeInTheDocument()
    })

    it('calls onDismiss when close button is clicked', () => {
      const onDismiss = vi.fn()
      
      render(<Toast id="1" type="success" message="Success" onDismiss={onDismiss} />)
      
      const closeButton = screen.getByRole('button', { name: /dismiss/i })
      fireEvent.click(closeButton)
      
      expect(onDismiss).toHaveBeenCalledWith('1')
    })

    it('auto-dismisses after specified duration', async () => {
      const onDismiss = vi.fn()
      
      render(
        <Toast id="1" type="success" message="Success" onDismiss={onDismiss} duration={3000} />
      )
      
      expect(onDismiss).not.toHaveBeenCalled()
      
      act(() => {
        vi.advanceTimersByTime(2999)
      })
      expect(onDismiss).not.toHaveBeenCalled()
      
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(onDismiss).toHaveBeenCalledWith('1')
    })

    it('does not auto-dismiss when duration is 0', () => {
      const onDismiss = vi.fn()
      
      render(
        <Toast id="1" type="success" message="Success" onDismiss={onDismiss} duration={0} />
      )
      
      act(() => {
        vi.advanceTimersByTime(10000)
      })
      
      expect(onDismiss).not.toHaveBeenCalled()
    })

    it('pauses auto-dismiss on hover', () => {
      const onDismiss = vi.fn()
      
      render(
        <Toast id="1" type="success" message="Success" onDismiss={onDismiss} duration={3000} />
      )
      
      const toast = screen.getByRole('alert')
      
      // Advance halfway through
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      
      // Hover to pause
      fireEvent.mouseEnter(toast)
      
      // Advance past the original duration
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      
      // Should not have dismissed
      expect(onDismiss).not.toHaveBeenCalled()
      
      // Unhover to resume
      fireEvent.mouseLeave(toast)
      
      // Should dismiss after remaining time (1500ms)
      act(() => {
        vi.advanceTimersByTime(1500)
      })
      
      expect(onDismiss).toHaveBeenCalledWith('1')
    })

    it('shows progress bar for auto-dismiss', () => {
      render(
        <Toast id="1" type="success" message="Success" onDismiss={() => {}} duration={3000} />
      )
      
      const progressBar = screen.getByTestId('toast-progress')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveStyle({ animationDuration: '3000ms' })
    })

    it('does not show progress bar when duration is 0', () => {
      render(
        <Toast id="1" type="success" message="Success" onDismiss={() => {}} duration={0} />
      )
      
      expect(screen.queryByTestId('toast-progress')).not.toBeInTheDocument()
    })
  })

  describe('ToastContainer', () => {
    const mockToasts = [
      { id: '1', type: 'success' as const, message: 'First toast' },
      { id: '2', type: 'error' as const, message: 'Second toast' },
      { id: '3', type: 'info' as const, message: 'Third toast' },
    ]

    it('renders multiple toasts', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={() => {}} />)
      
      expect(screen.getByText('First toast')).toBeInTheDocument()
      expect(screen.getByText('Second toast')).toBeInTheDocument()
      expect(screen.getByText('Third toast')).toBeInTheDocument()
    })

    it('stacks toasts vertically', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={() => {}} />)
      
      const container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('flex')
      expect(container).toHaveClass('flex-col')
      expect(container).toHaveClass('gap-2')
    })

    it('positions container at bottom right by default', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={() => {}} />)
      
      const container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('fixed')
      expect(container).toHaveClass('bottom-4')
      expect(container).toHaveClass('right-4')
    })

    it('supports different positions', () => {
      const { rerender } = render(
        <ToastContainer toasts={mockToasts} onDismiss={() => {}} position="top-right" />
      )
      
      let container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('top-4')
      expect(container).toHaveClass('right-4')
      
      rerender(
        <ToastContainer toasts={mockToasts} onDismiss={() => {}} position="top-left" />
      )
      container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('top-4')
      expect(container).toHaveClass('left-4')
      
      rerender(
        <ToastContainer toasts={mockToasts} onDismiss={() => {}} position="bottom-left" />
      )
      container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('bottom-4')
      expect(container).toHaveClass('left-4')
    })

    it('passes duration prop to toasts', () => {
      const onDismiss = vi.fn()
      render(
        <ToastContainer 
          toasts={[mockToasts[0]]} 
          onDismiss={onDismiss} 
          duration={5000} 
        />
      )
      
      act(() => {
        vi.advanceTimersByTime(5000)
      })
      
      expect(onDismiss).toHaveBeenCalledWith('1')
    })

    it('renders empty container when no toasts', () => {
      render(<ToastContainer toasts={[]} onDismiss={() => {}} />)
      
      const container = screen.getByTestId('toast-container')
      expect(container).toBeInTheDocument()
      expect(container.children).toHaveLength(0)
    })

    it('applies responsive width on mobile', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={() => {}} />)
      
      const container = screen.getByTestId('toast-container')
      expect(container).toHaveClass('w-full')
      expect(container).toHaveClass('sm:w-auto')
      expect(container).toHaveClass('px-4')
      expect(container).toHaveClass('sm:px-0')
    })
  })
})