import { test, expect } from '@playwright/test'

// Mock user credentials for testing
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('redirects unauthenticated users from protected routes', async ({ page }) => {
    // Try to access protected route
    await page.goto('/my-post')
    
    // Should be redirected to home
    await expect(page).toHaveURL('/')
  })

  test('handles auth callback redirect', async ({ page }) => {
    // Navigate to auth callback with code
    await page.goto('/auth/callback?code=test-code')
    
    // Should show error page if code is invalid
    await expect(page).toHaveURL('/auth/auth-code-error')
    await expect(page.getByText('Authentication Error')).toBeVisible()
  })

  test('auth error page displays correctly', async ({ page }) => {
    await page.goto('/auth/auth-code-error')
    
    await expect(page.getByRole('heading', { name: 'Authentication Error' })).toBeVisible()
    await expect(page.getByText('There was an error processing your authentication request')).toBeVisible()
    
    // Check return home link
    const homeLink = page.getByRole('link', { name: 'Return Home' })
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })

  test('protected routes require authentication', async ({ page }) => {
    // Test edit page
    await page.goto('/edit')
    await expect(page).toHaveURL('/')
    
    // Test my-post page
    await page.goto('/my-post')
    await expect(page).toHaveURL('/')
  })
})