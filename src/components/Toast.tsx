'use client'

import { useEffect, useRef, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastData {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void
}

export function Toast({ id, type, message, onDismiss, duration = 5000 }: ToastProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [remainingTime, setRemainingTime] = useState(duration)
  const startTimeRef = useRef<number>(Date.now())
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (duration === 0 || isPaused) return

    timerRef.current = setTimeout(() => {
      onDismiss(id)
    }, remainingTime)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [id, duration, remainingTime, isPaused, onDismiss])

  const handleMouseEnter = () => {
    if (duration === 0) return
    setIsPaused(true)
    const elapsed = Date.now() - startTimeRef.current
    setRemainingTime(Math.max(0, duration - elapsed))
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }

  const handleMouseLeave = () => {
    if (duration === 0) return
    setIsPaused(false)
    startTimeRef.current = Date.now()
  }

  const typeStyles = {
    success: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
    error: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
    info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100',
  }

  const icons = {
    success: (
      <svg
        data-testid="toast-icon-success"
        className="w-5 h-5 text-green-600 dark:text-green-400"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg
        data-testid="toast-icon-error"
        className="w-5 h-5 text-red-600 dark:text-red-400"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    info: (
      <svg
        data-testid="toast-icon-info"
        className="w-5 h-5 text-blue-600 dark:text-blue-400"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg
        data-testid="toast-icon-warning"
        className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  }

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 p-4 pr-12 border rounded-lg shadow-md transition-all duration-300 transform ${typeStyles[type]}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {duration > 0 && (
        <div
          data-testid="toast-progress"
          className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg origin-left ${
            isPaused ? '' : 'animate-shrink'
          }`}
          style={{
            width: '100%',
            animationDuration: `${duration}ms`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      )}
    </div>
  )
}

type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
  position?: ToastPosition
  duration?: number
}

export function ToastContainer({
  toasts,
  onDismiss,
  position = 'bottom-right',
  duration,
}: ToastContainerProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  }

  return (
    <div
      data-testid="toast-container"
      className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2 w-full sm:w-auto px-4 sm:px-0 pointer-events-none`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            {...toast}
            duration={toast.duration ?? duration}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  )
}