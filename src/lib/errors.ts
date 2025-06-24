/**
 * Error handling utilities for consistent error detection and user-friendly messages
 */

// Error message constants for consistency across the app
export const ErrorMessages = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
  NETWORK_TIMEOUT: 'The request took too long. Please try again.',
  
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_USER_NOT_FOUND: 'No account found with this email address.',
  AUTH_GENERIC: 'Authentication failed. Please try again.',
  
  // Validation errors
  VALIDATION_INVALID_EMAIL: 'Please enter a valid email address.',
  VALIDATION_REQUIRED_FIELD: 'This field is required.',
  VALIDATION_GENERIC: 'Please check your input and try again.',
  
  // Permission errors
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  
  // Server errors
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  
  // Generic error
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
} as const

/**
 * Detects if an error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as Error & { code?: string }
  const message = err.message?.toLowerCase() || ''
  
  // Check for common network error patterns
  const networkPatterns = [
    'network',
    'fetch',
    'econnrefused',
    'etimedout',
    'dns',
    'aborted',
    'err_internet_disconnected',
  ]
  
  // Check if it's a TypeError with "fetch" (common browser network error)
  if (err.name === 'TypeError' && message.includes('fetch')) {
    return true
  }
  
  return networkPatterns.some(pattern => message.includes(pattern))
}

/**
 * Detects if an error is authentication-related
 */
export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as Error & { code?: string; status?: number }
  const message = err.message?.toLowerCase() || ''
  const code = err.code?.toLowerCase() || ''
  
  // Check for 401 status
  if (err.status === 401) return true
  
  // Check for auth-related error codes
  if (code.includes('auth')) return true
  
  // Check for common auth error patterns
  // Be more specific about password errors - only auth-related password errors
  const authPatterns = [
    'unauthorized',
    'authentication',
    'login',
    'credential',
    'jwt',
    'token',
    'invalid password',
    'incorrect password',
    'wrong password',
    'user not found',
  ]
  
  return authPatterns.some(pattern => message.includes(pattern))
}

/**
 * Detects if an error is validation-related
 */
export function isValidationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as Error & { status?: number }
  const message = err.message?.toLowerCase() || ''
  
  // Check for validation status codes
  if (err.status === 400 || err.status === 422) return true
  
  // Check for common validation error patterns
  const validationPatterns = [
    'validation',
    'invalid',
    'required',
    'must be',
    'must contain',
    'must have',
    'should be',
    'format',
    'pattern',
  ]
  
  return validationPatterns.some(pattern => message.includes(pattern))
}

/**
 * Detects if an error is permission-related
 */
export function isPermissionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as Error & { status?: number }
  const message = err.message?.toLowerCase() || ''
  
  // Check for 403 status
  if (err.status === 403) return true
  
  // Check for common permission error patterns
  const permissionPatterns = [
    'permission',
    'forbidden',
    'access denied',
    'not authorized',
    'insufficient',
  ]
  
  return permissionPatterns.some(pattern => message.includes(pattern))
}

/**
 * Detects if an error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  
  const err = error as Error & { status?: number }
  const message = err.message?.toLowerCase() || ''
  
  // Check for 5xx status codes
  if (err.status && err.status >= 500 && err.status < 600) return true
  
  // Check for server error patterns
  const serverPatterns = [
    'internal server error',
    'service unavailable',
    'server error',
  ]
  
  return serverPatterns.some(pattern => message.includes(pattern))
}

/**
 * Maps technical errors to user-friendly messages
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return ErrorMessages.GENERIC_ERROR
  
  // Handle non-Error objects
  if (typeof error !== 'object' || !('message' in error)) {
    return ErrorMessages.GENERIC_ERROR
  }
  
  const err = error as Error
  const message = err.message?.toLowerCase() || ''
  
  // Network errors
  if (isNetworkError(error)) {
    if (message.includes('timeout')) return ErrorMessages.NETWORK_TIMEOUT
    return ErrorMessages.NETWORK_ERROR
  }
  
  // Check auth errors before validation since "invalid login credentials" should be auth
  if (isAuthError(error)) {
    if (message.includes('credential') || message.includes('login')) {
      return ErrorMessages.AUTH_INVALID_CREDENTIALS
    }
    if (message.includes('expired')) {
      return ErrorMessages.AUTH_SESSION_EXPIRED
    }
    if (message.includes('user not found')) {
      return ErrorMessages.AUTH_USER_NOT_FOUND
    }
    return ErrorMessages.AUTH_GENERIC
  }
  
  // Validation errors - check after auth to avoid conflicts
  if (isValidationError(error)) {
    // For specific validation messages, preserve them if they're user-friendly
    if (message.includes('must') || message.includes('should')) {
      // Capitalize first letter and return the original message
      return err.message.charAt(0).toUpperCase() + err.message.slice(1)
    }
    
    if (message.includes('email') && !message.includes('password')) {
      return ErrorMessages.VALIDATION_INVALID_EMAIL
    }
    if (message.includes('required')) {
      return ErrorMessages.VALIDATION_REQUIRED_FIELD
    }
    return ErrorMessages.VALIDATION_GENERIC
  }
  
  // Permission errors
  if (isPermissionError(error)) {
    return ErrorMessages.PERMISSION_DENIED
  }
  
  // Server errors
  if (isServerError(error)) {
    return ErrorMessages.SERVER_ERROR
  }
  
  // Default
  return ErrorMessages.GENERIC_ERROR
}

/**
 * Determines if an error should trigger a retry
 */
export function shouldRetry(
  error: unknown,
  attemptNumber: number = 1,
  maxAttempts: number = 3
): boolean {
  // Don't retry if we've exceeded max attempts
  if (attemptNumber >= maxAttempts) return false
  
  // Only retry for transient errors
  if (!error || typeof error !== 'object') return false
  
  // Retry network errors
  if (isNetworkError(error)) return true
  
  // Retry server errors (they might be temporary)
  if (isServerError(error)) return true
  
  // Don't retry client errors (4xx), auth errors, validation errors, or permission errors
  // as these are likely permanent failures that require user action
  return false
}

/**
 * Extracts error code from various error formats
 */
export function getErrorCode(error: unknown): string {
  if (!error || typeof error !== 'object') return 'UNKNOWN'
  
  const err = error as Error & { code?: string; status?: number }
  
  // Prefer explicit error code
  if (err.code) return err.code
  
  // Fall back to status code
  if (err.status) return err.status.toString()
  
  return 'UNKNOWN'
}