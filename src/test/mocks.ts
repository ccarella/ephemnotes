import { vi } from 'vitest'
import type { Database } from '@/lib/database.types'

// Mock types for Supabase client
export interface MockSupabaseAuth {
  getUser: ReturnType<typeof vi.fn>
}

export interface MockSupabaseQueryBuilder {
  from: ReturnType<typeof vi.fn>
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
}

export interface MockSupabaseClient extends MockSupabaseQueryBuilder {
  auth: MockSupabaseAuth
}

// Type for Post from database
export type Post = Database['public']['Tables']['posts']['Row']

// Type for API responses
export interface PostResponse {
  post: Post
}

export interface PostsResponse {
  posts: Post[]
}

export interface ErrorResponse {
  error: string
}