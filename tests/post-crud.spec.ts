import { test, expect } from '@playwright/test'

test.describe('Post CRUD operations', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/')
    // Assuming there's a login flow to set up authentication
  })

  test('should create a new post', async ({ page }) => {
    // Navigate to new post page
    await page.goto('/new-post')
    
    // Wait for the form to be visible
    await expect(page.getByRole('heading', { name: 'Create Post' })).toBeVisible()
    
    // Fill in the form
    await page.getByLabel('Title').fill('My Test Post')
    await page.getByLabel('Body').fill('This is a test post body that will disappear after 24 hours')
    
    // Submit the form
    await page.getByRole('button', { name: 'Publish Post' }).click()
    
    // Should redirect to my-post page
    await expect(page).toHaveURL('/my-post')
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/new-post')
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Publish Post' }).click()
    
    // Check for validation errors
    await expect(page.getByText('Title is required')).toBeVisible()
    await expect(page.getByText('Body is required')).toBeVisible()
  })

  test('should validate field lengths', async ({ page }) => {
    await page.goto('/new-post')
    
    // Fill with text that's too long
    const longTitle = 'a'.repeat(101)
    const longBody = 'b'.repeat(1001)
    
    await page.getByLabel('Title').fill(longTitle)
    await page.getByLabel('Body').fill(longBody)
    
    // Submit the form
    await page.getByRole('button', { name: 'Publish Post' }).click()
    
    // Check for validation errors
    await expect(page.getByText('Title must be between 1 and 100 characters')).toBeVisible()
    await expect(page.getByText('Body must be between 1 and 1000 characters')).toBeVisible()
  })

  test('should show character count', async ({ page }) => {
    await page.goto('/new-post')
    
    // Type in fields
    await page.getByLabel('Title').fill('Test')
    await page.getByLabel('Body').fill('Test body')
    
    // Check character counts
    await expect(page.getByText('4/100 characters')).toBeVisible()
    await expect(page.getByText('9/1000 characters')).toBeVisible()
  })

  test('should edit an existing post', async ({ page }) => {
    // Assuming we have a post ID to edit
    const postId = 'test-post-id'
    await page.goto(`/edit?id=${postId}`)
    
    // Wait for the form to load with existing data
    await expect(page.getByRole('heading', { name: 'Edit Post' })).toBeVisible()
    
    // Update the fields
    await page.getByLabel('Title').clear()
    await page.getByLabel('Title').fill('Updated Test Post')
    
    await page.getByLabel('Body').clear()
    await page.getByLabel('Body').fill('This is the updated post body')
    
    // Submit the form
    await page.getByRole('button', { name: 'Update Post' }).click()
    
    // Should redirect to my-post page
    await expect(page).toHaveURL('/my-post')
  })

  test('should handle cancel action', async ({ page }) => {
    await page.goto('/new-post')
    
    // Click cancel button
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Should navigate back
    await expect(page).not.toHaveURL('/new-post')
  })

  test('should show loading state during submission', async ({ page }) => {
    await page.goto('/new-post')
    
    // Fill in the form
    await page.getByLabel('Title').fill('Test Post')
    await page.getByLabel('Body').fill('Test post body')
    
    // Set up request interception to delay the response
    await page.route('**/posts', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await route.continue()
    })
    
    // Click submit
    await page.getByRole('button', { name: 'Publish Post' }).click()
    
    // Check for loading state
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible()
    await expect(page.getByLabel('Title')).toBeDisabled()
    await expect(page.getByLabel('Body')).toBeDisabled()
  })

  test('should handle submission errors', async ({ page }) => {
    await page.goto('/new-post')
    
    // Fill in the form
    await page.getByLabel('Title').fill('Test Post')
    await page.getByLabel('Body').fill('Test post body')
    
    // Set up request interception to return an error
    await page.route('**/posts', async (route) => {
      await route.fulfill({
        status: 500,
        json: { error: { message: 'Database error' } }
      })
    })
    
    // Click submit
    await page.getByRole('button', { name: 'Publish Post' }).click()
    
    // Check for error message
    await expect(page.getByText('Database error')).toBeVisible()
  })

  test('should redirect to new-post when edit page has no id', async ({ page }) => {
    await page.goto('/edit')
    
    // Should redirect to new-post page
    await expect(page).toHaveURL('/new-post')
  })
})