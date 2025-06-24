import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: AuthError | Error): string {
  // Handle Supabase specific auth errors
  if ('code' in error) {
    switch (error.code) {
      case 'user_already_exists':
        return 'An account with this email already exists. Please sign in instead.'
      
      case 'invalid_credentials':
        return 'Invalid email or password. Please check your credentials and try again.'
      
      case 'email_not_confirmed':
        return 'Please verify your email before signing in. Check your inbox for the verification link.'
      
      case 'weak_password':
        return 'Password is too weak. Please use at least 6 characters.'
      
      case 'over_request_rate_limit':
        return 'Too many attempts. Please wait a few minutes before trying again.'
      
      case 'email_address_invalid':
        return 'Please enter a valid email address.'
      
      case 'user_not_found':
        return 'No account found with this email. Please sign up first.'
      
      case 'email_change_needs_reauthentication':
        return 'Please sign in again to change your email address.'
      
      default:
        // Return the original message if we don't have a custom one
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  }
  
  // Handle generic errors
  if (error.message) {
    // Check for common error patterns in the message
    if (error.message.includes('duplicate key') || error.message.includes('already registered')) {
      return 'An account with this email already exists. Please sign in instead.'
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.'
    }
    
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email before signing in. Check your inbox for the verification link.'
    }
    
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}