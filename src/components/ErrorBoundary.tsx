'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import { TOUCH_TARGETS, TYPOGRAPHY } from '@/lib/responsive'

interface Props {
  children: ReactNode
  resetKeys?: Array<string | number>
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary()
      }
    }
  }

  resetErrorBoundary() {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md space-y-4">
            <h1 className={TYPOGRAPHY.title.lg}>Oops!</h1>
            <p className={TYPOGRAPHY.body.lg}>Something went wrong.</p>
            <p className={TYPOGRAPHY.muted}>
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className={`${TOUCH_TARGETS.button} ${TYPOGRAPHY.body.base} rounded-md bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors`}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
