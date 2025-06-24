import { test, expect } from '@playwright/test'

test.describe('Posts Empty State', () => {
  test('should display empty state when no posts exist', async ({ page }) => {
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("EphemNotes")')
    
    // Check for empty state message
    await expect(page.locator('text=Be the first to post')).toBeVisible()
    
    // Check for Create Post button
    const createPostButton = page.locator('button:has-text("Create Post")')
    await expect(createPostButton).toBeVisible()
  })

  test('should navigate to sign in when Create Post is clicked as unauthenticated user', async ({ page }) => {
    await page.goto('/')
    
    // Wait for empty state
    await page.waitForSelector('text=Be the first to post')
    
    // Click Create Post button
    await page.click('button:has-text("Create Post")')
    
    // Should redirect to sign in page (new-post is protected)
    await expect(page).toHaveURL('/')
    
    // Sign in modal should appear
    await expect(page.locator('h2:has-text("Sign In")')).toBeVisible()
  })

  test('should handle database initialization error gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Should show empty state instead of error when table doesn't exist
    await expect(page.locator('text=Be the first to post')).toBeVisible()
    
    // Should not show error messages
    await expect(page.locator('text=Unable to Load Posts')).not.toBeVisible()
    await expect(page.locator('text=Failed to load posts')).not.toBeVisible()
  })
})