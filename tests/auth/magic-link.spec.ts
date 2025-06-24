import { test, expect } from '@playwright/test'

// Test data
const validEmail = 'test@example.com'
const invalidEmails = [
  'invalid-email',
  'test@',
  '@example.com',
  'test @example.com',
  'test@example',
]

test.describe('Magic Link Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to sign-in page and display magic link form', async ({ page }) => {
    // Click sign in button to open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Auth modal should be visible
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Check for magic link option (assuming it's added to the existing modal)
    await expect(page.getByText('Sign in with magic link')).toBeVisible()
    
    // Email input should be present
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('type', 'text')
    await expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
  })

  test('should successfully submit magic link request with valid email', async ({ page }) => {
    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Enter valid email
    const emailInput = page.getByLabel('Email')
    await emailInput.fill(validEmail)

    // Submit form
    await page.getByRole('button', { name: 'Send Magic Link' }).click()

    // Check for success message
    await expect(page.getByText('Check your email!')).toBeVisible()
    await expect(page.getByText(`We've sent a magic link to ${validEmail}`)).toBeVisible()

    // Modal should remain open with success state
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    const emailInput = page.getByLabel('Email')
    const submitButton = page.getByRole('button', { name: 'Send Magic Link' })

    // Test each invalid email
    for (const invalidEmail of invalidEmails) {
      await emailInput.fill(invalidEmail)
      await submitButton.click()

      // Check for validation error
      await expect(page.getByText('Please enter a valid email')).toBeVisible()

      // Form should not be submitted
      await expect(page.getByText('Check your email!')).not.toBeVisible()
    }
  })

  test('should show error when submitting empty email', async ({ page }) => {
    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Submit without entering email
    await page.getByRole('button', { name: 'Send Magic Link' }).click()

    // Check for validation error
    await expect(page.getByText('Please enter a valid email')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept the API call and simulate network error
    await page.route('**/auth/v1/otp', (route) => {
      route.abort('failed')
    })

    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Enter valid email and submit
    await page.getByLabel('Email').fill(validEmail)
    await page.getByRole('button', { name: 'Send Magic Link' }).click()

    // Check for error message
    await expect(page.getByText(/network error|connection failed|try again/i)).toBeVisible()
  })

  test('should handle server errors gracefully', async ({ page }) => {
    // Intercept the API call and return server error
    await page.route('**/auth/v1/otp', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Enter valid email and submit
    await page.getByLabel('Email').fill(validEmail)
    await page.getByRole('button', { name: 'Send Magic Link' }).click()

    // Check for error message
    await expect(page.getByText(/error|failed|try again/i)).toBeVisible()
  })

  test('should handle rate limiting', async ({ page }) => {
    // Intercept the API call and return rate limit error
    await page.route('**/auth/v1/otp', (route) => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Too many requests',
          message: 'Email rate limit exceeded' 
        }),
      })
    })

    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Enter valid email and submit
    await page.getByLabel('Email').fill(validEmail)
    await page.getByRole('button', { name: 'Send Magic Link' }).click()

    // Check for rate limit error message
    await expect(page.getByText(/too many requests|rate limit|try again later/i)).toBeVisible()
  })

  test('should disable submit button while loading', async ({ page }) => {
    // Intercept the API call and delay response
    await page.route('**/auth/v1/otp', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    })

    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Enter valid email
    await page.getByLabel('Email').fill(validEmail)

    // Submit form
    const submitButton = page.getByRole('button', { name: 'Send Magic Link' })
    await submitButton.click()

    // Button should be disabled and show loading state
    await expect(submitButton).toBeDisabled()
    await expect(submitButton).toHaveText(/sending|loading/i)

    // Email input should also be disabled
    await expect(page.getByLabel('Email')).toBeDisabled()
  })

  test('should allow user to close modal with close button', async ({ page }) => {
    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Click close button
    await page.getByLabel('Close').click()

    // Modal should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should allow user to close modal by clicking overlay', async ({ page }) => {
    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Click outside the modal (on the overlay)
    await page.locator('[class*="overlay"]').click({ position: { x: 10, y: 10 } })

    // Modal should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should reset form when modal is reopened', async ({ page }) => {
    // Open auth modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Enter email
    const emailInput = page.getByLabel('Email')
    await emailInput.fill(validEmail)

    // Close modal
    await page.getByLabel('Close').click()

    // Reopen modal
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Email input should be empty
    await expect(page.getByLabel('Email')).toHaveValue('')
  })
})

test.describe('Magic Link Authentication - Responsive Behavior', () => {
  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Open mobile menu
    await page.getByLabel('Toggle menu').click()

    // Click sign in button in mobile menu
    await page.locator('[class*="mobileMenu.menu"] button:has-text("Sign In")').click()

    // Auth modal should be visible and full-screen on mobile
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Email input should be visible and have proper touch target size
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toBeVisible()
    const inputBox = await emailInput.boundingBox()
    expect(inputBox?.height).toBeGreaterThanOrEqual(44)

    // Submit button should have proper touch target size
    const submitButton = page.getByRole('button', { name: 'Send Magic Link' })
    const buttonBox = await submitButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)

    // Test form submission on mobile
    await emailInput.fill(validEmail)
    await submitButton.click()

    // Success message should be visible
    await expect(page.getByText('Check your email!')).toBeVisible()
  })

  test('should work correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    // Sign in button should be visible in desktop menu
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Modal should be centered with proper padding
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Test form submission
    await page.getByLabel('Email').fill(validEmail)
    await page.getByRole('button', { name: 'Send Magic Link' }).click()

    // Success message should be visible
    await expect(page.getByText('Check your email!')).toBeVisible()
  })

  test('should maintain focus management for accessibility', async ({ page }) => {
    await page.goto('/')

    // Open auth modal
    const signInButton = page.getByRole('button', { name: 'Sign In' })
    await signInButton.click()

    // Focus should be trapped within modal
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()

    // Switch to magic link mode
    await page.getByText('Sign in with magic link').click()

    // Tab through focusable elements
    await page.keyboard.press('Tab')
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab')
    const submitButton = page.getByRole('button', { name: 'Send Magic Link' })
    await expect(submitButton).toBeFocused()

    await page.keyboard.press('Tab')
    const closeButton = page.getByLabel('Close')
    await expect(closeButton).toBeFocused()

    // Tab should cycle back to first element
    await page.keyboard.press('Tab')
    await expect(emailInput).toBeFocused()

    // Close modal
    await closeButton.click()

    // Focus should return to sign in button
    await expect(signInButton).toBeFocused()
  })
})