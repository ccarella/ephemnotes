import { describe, it, expect } from 'vitest'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  parseRequestBody, 
  isSupabaseNotFoundError,
  APIError 
} from './api-utils'
import { NextRequest } from 'next/server'

describe('api-utils', () => {
  describe('createSuccessResponse', () => {
    it('should create a success response with default status', async () => {
      const data = { message: 'Success' }
      const response = createSuccessResponse(data)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
      
      const body = await response.json()
      expect(body).toEqual(data)
    })

    it('should create a success response with custom status', async () => {
      const data = { id: '123' }
      const response = createSuccessResponse(data, 201)
      
      expect(response.status).toBe(201)
      
      const body = await response.json()
      expect(body).toEqual(data)
    })
  })

  describe('createErrorResponse', () => {
    it('should create an error response with default status', async () => {
      const response = createErrorResponse('Something went wrong')
      
      expect(response.status).toBe(500)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0')
      
      const body = await response.json()
      expect(body).toEqual({ error: 'Something went wrong' })
    })

    it('should create an error response with custom status', async () => {
      const response = createErrorResponse('Not found', 404)
      
      expect(response.status).toBe(404)
      
      const body = await response.json()
      expect(body).toEqual({ error: 'Not found' })
    })
  })

  describe('parseRequestBody', () => {
    it('should parse valid JSON body', async () => {
      const data = { title: 'Test', body: 'Content' }
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      const result = await parseRequestBody(request)
      expect(result).toEqual(data)
    })

    it('should return null for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: 'invalid json'
      })
      
      const result = await parseRequestBody(request)
      expect(result).toBeNull()
    })
  })

  describe('isSupabaseNotFoundError', () => {
    it('should return true for Supabase not found error', () => {
      const error = { code: 'PGRST116', message: 'No rows found' }
      expect(isSupabaseNotFoundError(error)).toBe(true)
    })

    it('should return false for other errors', () => {
      expect(isSupabaseNotFoundError({ code: 'OTHER' })).toBe(false)
      expect(isSupabaseNotFoundError({ message: 'Error' })).toBe(false)
      expect(isSupabaseNotFoundError(null)).toBe(false)
      expect(isSupabaseNotFoundError(undefined)).toBe(false)
    })
  })

  describe('APIError', () => {
    it('should create an error with default status', () => {
      const error = new APIError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(500)
      expect(error.name).toBe('APIError')
    })

    it('should create an error with custom status', () => {
      const error = new APIError('Not found', 404)
      
      expect(error.message).toBe('Not found')
      expect(error.status).toBe(404)
    })
  })
})