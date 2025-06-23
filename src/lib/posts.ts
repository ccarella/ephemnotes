import { createClient } from '@supabase/supabase-js'
import type { Database, Tables, TablesInsert, TablesUpdate } from './database.types'

export type Post = Tables<'posts'>
export type PostInsert = TablesInsert<'posts'>
export type PostUpdate = TablesUpdate<'posts'>

export async function getPosts(supabase: ReturnType<typeof createClient<Database>>) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getPostById(
  supabase: ReturnType<typeof createClient<Database>>,
  id: string
) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getPostsByUserId(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createPost(
  supabase: ReturnType<typeof createClient<Database>>,
  post: PostInsert
) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePost(
  supabase: ReturnType<typeof createClient<Database>>,
  id: string,
  updates: PostUpdate
) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePost(
  supabase: ReturnType<typeof createClient<Database>>,
  id: string
) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}