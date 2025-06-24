import { createServerSupabaseClient } from '@/lib/supabase'
import { createSuccessResponse, createErrorResponse, isSupabaseNotFoundError } from '@/lib/api-utils'

export async function GET() {
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

  // Query the posts table to get the single post for the authenticated user
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Handle specific error cases
  if (error) {
    // Return 404 if no post found (PGRST116 error code)
    if (isSupabaseNotFoundError(error)) {
      return createErrorResponse('No post found for this user', 404)
    }

    // Return 500 for other database errors
    return createErrorResponse('Failed to fetch post')
  }

  // Return the post successfully
  return createSuccessResponse({ post })
}
