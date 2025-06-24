import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  parseRequestBody,
  isSupabaseNotFoundError 
} from '@/lib/api-utils'

interface PostRequestBody {
  id?: string
  title: string
  body?: string | null
  published?: boolean
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  // Get the authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Return 401 if no user is authenticated or if there's an auth error
  if (!user || authError) {
    return createErrorResponse('Unauthorized', 401)
  }

  // Parse the request body
  const body = await parseRequestBody<PostRequestBody>(request)
  if (!body) {
    return createErrorResponse('Invalid request body', 400)
  }

  // Validate that title is required
  if (!body.title) {
    return createErrorResponse('Title is required', 400)
  }

  // If id is provided, update existing post
  if (body.id) {
    const { data: post, error } = await supabase
      .from('posts')
      .update({
        title: body.title,
        body: body.body,
        published: body.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      // Return 404 for non-existent posts (PGRST116)
      if (isSupabaseNotFoundError(error)) {
        return createErrorResponse('Post not found or unauthorized', 404)
      }

      // Return 500 for other database errors
      return createErrorResponse('Failed to update post')
    }

    // Return the updated post with 200 status
    return createSuccessResponse({ post })
  }

  // Create new post
  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous'
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title: body.title,
      body: body.body,
      published: body.published,
      user_id: user.id,
      username: username,
    })
    .select()
    .single()

  if (error) {
    return createErrorResponse('Failed to save post')
  }

  // Return the created post with 201 status
  return createSuccessResponse({ post }, 201)
}