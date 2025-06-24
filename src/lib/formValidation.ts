import * as yup from 'yup'

// Signup form validation schema
export const signupSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(72, 'Password must be less than 72 characters')
    .test('no-spaces', 'Password cannot contain spaces', value => {
      // Only validate spaces if value is not empty
      if (!value) return true
      return /^[\S]+$/.test(value)
    }),
})

// Type for the signup form data
export type SignupFormData = yup.InferType<typeof signupSchema>

// Helper function to extract first error message from Yup validation error
export function getValidationError(error: unknown): string | null {
  if (error instanceof yup.ValidationError && error.errors.length > 0) {
    return error.errors[0]
  }
  return null
}

// Helper function to get field-specific error from Yup validation error
export function getFieldError(error: unknown, fieldName: string): string | null {
  if (error instanceof yup.ValidationError) {
    const fieldError = error.inner.find(err => err.path === fieldName)
    return fieldError?.message || null
  }
  return null
}

// Helper function to get all field errors from Yup validation error
export function getAllFieldErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {}
  
  if (error instanceof yup.ValidationError) {
    error.inner.forEach(err => {
      if (err.path) {
        errors[err.path] = err.message
      }
    })
  }
  
  return errors
}

// Helper function to validate a single field
export async function validateField(
  schema: yup.AnySchema,
  fieldName: string,
  value: unknown
): Promise<string | null> {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value })
    return null
  } catch (error) {
    return getValidationError(error)
  }
}

// Helper function for form validation with better error handling
export async function validateForm<T>(
  schema: yup.Schema<T>,
  data: unknown
): Promise<{ isValid: true; data: T } | { isValid: false; errors: Record<string, string> }> {
  try {
    const validData = await schema.validate(data, { abortEarly: false })
    return { isValid: true, data: validData }
  } catch (error) {
    return { isValid: false, errors: getAllFieldErrors(error) }
  }
}