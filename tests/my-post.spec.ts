import { test, expect } from '@playwright/test'

test.describe('My Post Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/my-post')
  })

  test('redirects to sign in when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Sign In')).toBeVisible()
  })

  test.describe('authenticated user', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')
      await page.getByText('Sign In').click()
      
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Sign In' }).click()
      
      await expect(page.getByText('test@example.com')).toBeVisible()
      
      await page.goto('/my-post')
    })

    test('displays page title and description', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'My Post' })).toBeVisible()
      await expect(page.getByText('View and manage your ephemeral thought')).toBeVisible()
    })

    test('shows empty state when user has no posts', async ({ page }) => {
      await expect(page.getByText('Your Current Post')).toBeVisible()
      await expect(page.getByText("You haven't created a post yet.")).toBeVisible()
      
      const createLink = page.getByRole('link', { name: 'Create Your First Post' })
      await expect(createLink).toBeVisible()
      await expect(createLink).toHaveAttribute('href', '/new-post')
    })

    test('displays user posts when they exist', async ({ page }) => {
      await page.goto('/new-post')
      await page.getByLabel('Title').fill('My Test Post')
      await page.getByLabel('Body').fill('This is my test post content')
      await page.getByRole('button', { name: 'Create Post' }).click()
      
      await page.waitForURL('/my-post')
      
      await expect(page.getByText('My Test Post')).toBeVisible()
      await expect(page.getByText('This is my test post content')).toBeVisible()
      await expect(page.getByText('Draft')).toBeVisible()
    })

    test('shows edit button for each post', async ({ page }) => {
      await page.goto('/new-post')
      await page.getByLabel('Title').fill('Post to Edit')
      await page.getByLabel('Body').fill('This post will be edited')
      await page.getByRole('button', { name: 'Create Post' }).click()
      
      await page.waitForURL('/my-post')
      
      const editButton = page.getByRole('link', { name: 'Edit Post' })
      await expect(editButton).toBeVisible()
      
      await editButton.click()
      await expect(page).toHaveURL(/\/edit\?id=/)
      await expect(page.getByLabel('Title')).toHaveValue('Post to Edit')
    })

    test('displays multiple posts', async ({ page }) => {
      await page.goto('/new-post')
      await page.getByLabel('Title').fill('First Post')
      await page.getByLabel('Body').fill('First post content')
      await page.getByRole('button', { name: 'Create Post' }).click()
      
      await page.waitForURL('/my-post')
      
      await page.goto('/new-post')
      await page.getByLabel('Title').fill('Second Post')
      await page.getByLabel('Body').fill('Second post content')
      await page.getByRole('button', { name: 'Create Post' }).click()
      
      await page.waitForURL('/my-post')
      
      await expect(page.getByText('First Post')).toBeVisible()
      await expect(page.getByText('First post content')).toBeVisible()
      await expect(page.getByText('Second Post')).toBeVisible()
      await expect(page.getByText('Second post content')).toBeVisible()
      
      const editButtons = page.getByRole('link', { name: 'Edit Post' })
      await expect(editButtons).toHaveCount(2)
    })

    test('handles loading and error states', async ({ page }) => {
      await page.route('**/rest/v1/posts*', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        })
      })
      
      await page.reload()
      
      await expect(page.getByText('Failed to load your posts. Please try again.')).toBeVisible()
    })
  })
})