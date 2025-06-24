import { test, expect } from '@playwright/test'

test.describe('Routing and Navigation', () => {
  test('can navigate to home page', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('EphemNotes')
    await expect(page.locator('text=Recent Posts')).toBeVisible()
  })

  test('protected routes redirect to home when not authenticated', async ({ page }) => {
    // Try to access protected route
    await page.goto('/my-post')

    // Should be redirected to home
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('EphemNotes')
  })

  test('can access edit page when authenticated', async ({ page }) => {
    // TODO: Implement after auth is set up
    // For now, just check that the route exists
    await page.goto('/edit')

    // Should be redirected to home since we're not authenticated
    await expect(page).toHaveURL('/')
  })
})
