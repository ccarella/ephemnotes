import { describe, it, expect } from 'vitest'
import {
  isNetworkError,
  isAuthError,
  isValidationError,
  isPermissionError,
  getFriendlyErrorMessage,
  shouldRetry,
  ErrorMessages,
  getErrorCode,
  isServerError,
} from './errors'

describe('Error Detection', () => {
  describe('isNetworkError', () => {
    it('should detect network errors by message', () => {
      expect(isNetworkError(new Error('Network request failed'))).toBe(true)
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true)
      expect(isNetworkError(new Error('NetworkError'))).toBe(true)
      expect(isNetworkError(new Error('ERR_NETWORK'))).toBe(true)
      expect(isNetworkError(new Error('ERR_INTERNET_DISCONNECTED'))).toBe(true)
      expect(isNetworkError(new Error('ECONNREFUSED'))).toBe(true)
      expect(isNetworkError(new Error('ETIMEDOUT'))).toBe(true)
      expect(isNetworkError(new Error('DNS lookup failed'))).toBe(true)
    })

    it('should detect network errors by type', () => {
      const typeError = new TypeError('Failed to fetch')
      expect(isNetworkError(typeError)).toBe(true)
    })

    it('should detect fetch abort errors', () => {
      const abortError = new Error('The operation was aborted')
      expect(isNetworkError(abortError)).toBe(true)
    })

    it('should not detect non-network errors', () => {
      expect(isNetworkError(new Error('Invalid input'))).toBe(false)
      expect(isNetworkError(new Error('Permission denied'))).toBe(false)
    })
  })

  describe('isAuthError', () => {
    it('should detect authentication errors by message', () => {
      expect(isAuthError(new Error('Invalid login credentials'))).toBe(true)
      expect(isAuthError(new Error('JWT expired'))).toBe(true)
      expect(isAuthError(new Error('Token invalid'))).toBe(true)
      expect(isAuthError(new Error('Unauthorized'))).toBe(true)
      expect(isAuthError(new Error('Authentication failed'))).toBe(true)
      expect(isAuthError(new Error('Invalid password'))).toBe(true)
      expect(isAuthError(new Error('Incorrect password'))).toBe(true)
      expect(isAuthError(new Error('Wrong password'))).toBe(true)
      expect(isAuthError(new Error('User not found'))).toBe(true)
    })

    it('should detect auth errors with error codes', () => {
      const errorWithCode = new Error('Auth error')
      ;(errorWithCode as { code?: string; status?: number }).code = 'auth/invalid-credential'
      expect(isAuthError(errorWithCode)).toBe(true)
    })

    it('should detect 401 status codes', () => {
      const errorWithStatus = new Error('Request failed')
      ;(errorWithStatus as { code?: string; status?: number }).status = 401
      expect(isAuthError(errorWithStatus)).toBe(true)
    })

    it('should not detect non-auth errors', () => {
      expect(isAuthError(new Error('Network error'))).toBe(false)
      expect(isAuthError(new Error('Server error'))).toBe(false)
      expect(isAuthError(new Error('Password must be at least 8 characters'))).toBe(false)
      expect(isAuthError(new Error('Password should contain numbers'))).toBe(false)
    })
  })

  describe('isValidationError', () => {
    it('should detect validation errors by message', () => {
      expect(isValidationError(new Error('Validation failed'))).toBe(true)
      expect(isValidationError(new Error('Invalid email format'))).toBe(true)
      expect(isValidationError(new Error('Required field missing'))).toBe(true)
      expect(isValidationError(new Error('Invalid input'))).toBe(true)
      expect(isValidationError(new Error('Field must be'))).toBe(true)
      expect(isValidationError(new Error('does not match pattern'))).toBe(true)
    })

    it('should detect 422 status codes', () => {
      const errorWithStatus = new Error('Unprocessable entity')
      ;(errorWithStatus as { code?: string; status?: number }).status = 422
      expect(isValidationError(errorWithStatus)).toBe(true)
    })

    it('should detect 400 status codes', () => {
      const errorWithStatus = new Error('Bad request')
      ;(errorWithStatus as { code?: string; status?: number }).status = 400
      expect(isValidationError(errorWithStatus)).toBe(true)
    })

    it('should not detect non-validation errors', () => {
      expect(isValidationError(new Error('Network error'))).toBe(false)
      expect(isValidationError(new Error('Server error'))).toBe(false)
    })
  })

  describe('isPermissionError', () => {
    it('should detect permission errors by message', () => {
      expect(isPermissionError(new Error('Permission denied'))).toBe(true)
      expect(isPermissionError(new Error('Access denied'))).toBe(true)
      expect(isPermissionError(new Error('Forbidden'))).toBe(true)
      expect(isPermissionError(new Error('Not authorized'))).toBe(true)
      expect(isPermissionError(new Error('Insufficient permissions'))).toBe(true)
    })

    it('should detect 403 status codes', () => {
      const errorWithStatus = new Error('Forbidden')
      ;(errorWithStatus as { code?: string; status?: number }).status = 403
      expect(isPermissionError(errorWithStatus)).toBe(true)
    })

    it('should not detect non-permission errors', () => {
      expect(isPermissionError(new Error('Network error'))).toBe(false)
      expect(isPermissionError(new Error('Invalid input'))).toBe(false)
    })
  })

  describe('isServerError', () => {
    it('should detect server errors by status code', () => {
      const error500 = new Error('Internal server error')
      ;(error500 as { code?: string; status?: number }).status = 500
      expect(isServerError(error500)).toBe(true)

      const error502 = new Error('Bad gateway')
      ;(error502 as { code?: string; status?: number }).status = 502
      expect(isServerError(error502)).toBe(true)

      const error503 = new Error('Service unavailable')
      ;(error503 as { code?: string; status?: number }).status = 503
      expect(isServerError(error503)).toBe(true)
    })

    it('should detect server errors by message', () => {
      expect(isServerError(new Error('Internal server error'))).toBe(true)
      expect(isServerError(new Error('Service unavailable'))).toBe(true)
      expect(isServerError(new Error('Server error'))).toBe(true)
    })

    it('should not detect non-server errors', () => {
      const error400 = new Error('Bad request')
      ;(error400 as { code?: string; status?: number }).status = 400
      expect(isServerError(error400)).toBe(false)

      expect(isServerError(new Error('Network error'))).toBe(false)
    })
  })
})

describe('getFriendlyErrorMessage', () => {
  it('should return friendly message for network errors', () => {
    expect(getFriendlyErrorMessage(new Error('Network request failed'))).toBe(
      ErrorMessages.NETWORK_ERROR
    )
    expect(getFriendlyErrorMessage(new Error('Failed to fetch'))).toBe(
      ErrorMessages.NETWORK_ERROR
    )
  })

  it('should return friendly message for auth errors', () => {
    expect(getFriendlyErrorMessage(new Error('Invalid login credentials'))).toBe(
      ErrorMessages.AUTH_INVALID_CREDENTIALS
    )
    expect(getFriendlyErrorMessage(new Error('JWT expired'))).toBe(
      ErrorMessages.AUTH_SESSION_EXPIRED
    )
    expect(getFriendlyErrorMessage(new Error('User not found'))).toBe(
      ErrorMessages.AUTH_USER_NOT_FOUND
    )
  })

  it('should return friendly message for validation errors', () => {
    expect(getFriendlyErrorMessage(new Error('Invalid email format'))).toBe(
      ErrorMessages.VALIDATION_INVALID_EMAIL
    )
    expect(getFriendlyErrorMessage(new Error('Required field missing'))).toBe(
      ErrorMessages.VALIDATION_REQUIRED_FIELD
    )
  })

  it('should return friendly message for permission errors', () => {
    expect(getFriendlyErrorMessage(new Error('Permission denied'))).toBe(
      ErrorMessages.PERMISSION_DENIED
    )
    expect(getFriendlyErrorMessage(new Error('Access denied'))).toBe(
      ErrorMessages.PERMISSION_DENIED
    )
  })

  it('should return friendly message for server errors', () => {
    const serverError = new Error('Internal server error')
    ;(serverError as { code?: string; status?: number }).status = 500
    expect(getFriendlyErrorMessage(serverError)).toBe(ErrorMessages.SERVER_ERROR)
  })

  it('should preserve specific validation messages', () => {
    expect(getFriendlyErrorMessage(new Error('Password must be at least 8 characters'))).toBe(
      'Password must be at least 8 characters'
    )
    expect(getFriendlyErrorMessage(new Error('Email must contain @ symbol'))).toBe(
      'Email must contain @ symbol'
    )
  })

  it('should return generic message for unknown errors', () => {
    expect(getFriendlyErrorMessage(new Error('Some random error'))).toBe(
      ErrorMessages.GENERIC_ERROR
    )
  })

  it('should handle null and undefined', () => {
    expect(getFriendlyErrorMessage(null)).toBe(ErrorMessages.GENERIC_ERROR)
    expect(getFriendlyErrorMessage(undefined)).toBe(ErrorMessages.GENERIC_ERROR)
  })

  it('should handle non-Error objects', () => {
    expect(getFriendlyErrorMessage('string error')).toBe(ErrorMessages.GENERIC_ERROR)
    expect(getFriendlyErrorMessage(404)).toBe(ErrorMessages.GENERIC_ERROR)
    expect(getFriendlyErrorMessage({})).toBe(ErrorMessages.GENERIC_ERROR)
  })
})

describe('shouldRetry', () => {
  it('should retry network errors', () => {
    expect(shouldRetry(new Error('Network request failed'))).toBe(true)
    expect(shouldRetry(new Error('Failed to fetch'))).toBe(true)
  })

  it('should retry server errors (5xx)', () => {
    const error500 = new Error('Internal server error')
    ;(error500 as { code?: string; status?: number }).status = 500
    expect(shouldRetry(error500)).toBe(true)

    const error503 = new Error('Service unavailable')
    ;(error503 as { code?: string; status?: number }).status = 503
    expect(shouldRetry(error503)).toBe(true)
  })

  it('should not retry auth errors', () => {
    expect(shouldRetry(new Error('Invalid login credentials'))).toBe(false)
    expect(shouldRetry(new Error('JWT expired'))).toBe(false)
  })

  it('should not retry validation errors', () => {
    expect(shouldRetry(new Error('Invalid email format'))).toBe(false)
    expect(shouldRetry(new Error('Validation failed'))).toBe(false)
  })

  it('should not retry permission errors', () => {
    expect(shouldRetry(new Error('Permission denied'))).toBe(false)
    expect(shouldRetry(new Error('Access denied'))).toBe(false)
  })

  it('should not retry client errors (4xx)', () => {
    const error400 = new Error('Bad request')
    ;(error400 as { code?: string; status?: number }).status = 400
    expect(shouldRetry(error400)).toBe(false)

    const error404 = new Error('Not found')
    ;(error404 as { code?: string; status?: number }).status = 404
    expect(shouldRetry(error404)).toBe(false)
  })

  it('should handle non-Error objects', () => {
    expect(shouldRetry(null)).toBe(false)
    expect(shouldRetry(undefined)).toBe(false)
    expect(shouldRetry('string error')).toBe(false)
  })

  it('should respect maxAttempts parameter', () => {
    const networkError = new Error('Network request failed')
    expect(shouldRetry(networkError, 1, 3)).toBe(true)
    expect(shouldRetry(networkError, 2, 3)).toBe(true)
    expect(shouldRetry(networkError, 3, 3)).toBe(false)
    expect(shouldRetry(networkError, 4, 3)).toBe(false)
  })
})

describe('getErrorCode', () => {
  it('should extract error code from error object', () => {
    const errorWithCode = new Error('Auth error')
    ;(errorWithCode as { code?: string; status?: number }).code = 'AUTH_001'
    expect(getErrorCode(errorWithCode)).toBe('AUTH_001')
  })

  it('should extract status code as string', () => {
    const errorWithStatus = new Error('Not found')
    ;(errorWithStatus as { code?: string; status?: number }).status = 404
    expect(getErrorCode(errorWithStatus)).toBe('404')
  })

  it('should prefer code over status', () => {
    const errorWithBoth = new Error('Error')
    ;(errorWithBoth as { code?: string; status?: number }).code = 'CUSTOM_CODE'
    ;(errorWithBoth as { code?: string; status?: number }).status = 500
    expect(getErrorCode(errorWithBoth)).toBe('CUSTOM_CODE')
  })

  it('should return UNKNOWN for errors without code', () => {
    expect(getErrorCode(new Error('No code'))).toBe('UNKNOWN')
    expect(getErrorCode(null)).toBe('UNKNOWN')
    expect(getErrorCode(undefined)).toBe('UNKNOWN')
  })
})