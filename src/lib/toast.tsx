'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ToastContainer, type ToastData, type ToastType } from '@/components/Toast'

interface ToastOptions {
  duration?: number
  type?: ToastType
}

interface ToastContextValue {
  toasts: ToastData[]
  toast: {
    success: (message: string, options?: ToastOptions) => string
    error: (message: string, options?: ToastOptions) => string
    info: (message: string, options?: ToastOptions) => string
    warning: (message: string, options?: ToastOptions) => string
    custom: (message: string, options: ToastOptions & { type: ToastType }) => string
    dismiss: (id: string) => void
    dismissAll: () => void
  }
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  duration?: number
  maxToasts?: number
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  duration = 5000,
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newToast: ToastData = {
        id,
        type,
        message,
        duration: options?.duration ?? duration,
      }

      setToasts((prev) => {
        const updated = [...prev, newToast]
        // Limit number of toasts
        if (updated.length > maxToasts) {
          return updated.slice(updated.length - maxToasts)
        }
        return updated
      })

      return id
    },
    [duration, maxToasts]
  )

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const toast = {
    success: (message: string, options?: ToastOptions) =>
      addToast('success', message, options),
    error: (message: string, options?: ToastOptions) =>
      addToast('error', message, options),
    info: (message: string, options?: ToastOptions) =>
      addToast('info', message, options),
    warning: (message: string, options?: ToastOptions) =>
      addToast('warning', message, options),
    custom: (message: string, options: ToastOptions & { type: ToastType }) =>
      addToast(options.type, message, options),
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
  }

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        position={position}
        duration={duration}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}