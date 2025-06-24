import { createServerSupabaseClient } from '@/lib/supabase'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      return createErrorResponse('Failed to fetch posts')
    }
    
    return createSuccessResponse({ posts: posts || [] })
  } catch {
    return createErrorResponse('Failed to fetch posts')
  }
}