import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show mobile menu on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Mobile menu button should be visible
    const mobileMenuButton = page.getByLabel('Toggle menu')
    await expect(mobileMenuButton).toBeVisible()

    // Desktop menu should not be visible
    const desktopSignIn = page.locator('.hidden.sm\\:flex button:has-text("Sign In")')
    await expect(desktopSignIn).not.toBeVisible()

    // Click mobile menu button
    await mobileMenuButton.click()

    // Mobile menu should be visible
    const mobileMenu = page.locator('[class*="mobileMenu.menu"]')
    await expect(mobileMenu).toBeVisible()

    // Sign in button in mobile menu should be visible
    const mobileSignIn = mobileMenu.locator('button:has-text("Sign In")')
    await expect(mobileSignIn).toBeVisible()
  })

  test('should hide mobile menu on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 })

    // Mobile menu button should not be visible
    const mobileMenuButton = page.getByLabel('Toggle menu')
    await expect(mobileMenuButton).not.toBeVisible()

    // Desktop sign in button should be visible
    const desktopSignIn = page.locator('.hidden.sm\\:flex button:has-text("Sign In")')
    await expect(desktopSignIn).toBeVisible()
  })

  test('should close mobile menu when sign in is clicked', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Open mobile menu
    const mobileMenuButton = page.getByLabel('Toggle menu')
    await mobileMenuButton.click()

    // Click sign in button in mobile menu
    const mobileSignIn = page.locator('[class*="mobileMenu.menu"] button:has-text("Sign In")')
    await mobileSignIn.click()

    // Auth modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible()

    // Mobile menu should be closed
    const mobileMenu = page.locator('[class*="mobileMenu.menu"]')
    await expect(mobileMenu).not.toBeVisible()
  })

  test('should have touch-friendly tap targets', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile menu button size
    const mobileMenuButton = page.getByLabel('Toggle menu')
    const buttonBox = await mobileMenuButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44)
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44)

    // Open mobile menu
    await mobileMenuButton.click()

    // Check sign in button size in mobile menu
    const mobileSignIn = page.locator('[class*="mobileMenu.menu"] button:has-text("Sign In")')
    const signInBox = await mobileSignIn.boundingBox()
    expect(signInBox?.height).toBeGreaterThanOrEqual(44)
  })
})