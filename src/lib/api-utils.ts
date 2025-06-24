import { NextResponse } from 'next/server'

export function createSuccessResponse(data: unknown, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}

export function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  )
}

export async function parseRequestBody<T>(request: Request): Promise<T | null> {
  try {
    const body = await request.json()
    return body as T
  } catch {
    return null
  }
}

export function isSupabaseNotFoundError(error: unknown): boolean {
  return (error as { code?: string })?.code === 'PGRST116'
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message)
    this.name = 'APIError'
  }
}