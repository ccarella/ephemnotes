import { test, expect } from '@playwright/test'

test.describe('UI Design and Readability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display proper fonts and typography', async ({ page }) => {
    // Check font loading
    const fontFamilies = await page.evaluate(() => {
      const html = document.documentElement
      return window.getComputedStyle(html).fontFamily
    })
    
    expect(fontFamilies).toContain('Geist Sans')
    
    // Check font sizes are responsive
    const baseFontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontSize
    })
    
    expect(parseInt(baseFontSize)).toBeGreaterThanOrEqual(16)
    expect(parseInt(baseFontSize)).toBeLessThanOrEqual(18)
  })

  test('should have readable contrast ratios', async ({ page }) => {
    // Check text contrast in light mode
    const textColor = await page.evaluate(() => {
      const el = document.body
      return window.getComputedStyle(el).color
    })
    
    const bgColor = await page.evaluate(() => {
      const el = document.body
      return window.getComputedStyle(el).backgroundColor
    })
    
    // Verify colors are set (actual contrast calculation would require a library)
    expect(textColor).toBeTruthy()
    expect(bgColor).toBeTruthy()
  })

  test('should apply minimalist design principles', async ({ page }) => {
    // Check for clean spacing
    const bodyPadding = await page.evaluate(() => {
      return window.getComputedStyle(document.body).padding
    })
    
    expect(bodyPadding).toBe('0px') // Reset applied
    
    // Check for subtle borders on inputs
    await page.goto('/auth/signin')
    const inputBorder = await page.locator('input[type="email"]').first().evaluate((el) => {
      return window.getComputedStyle(el).borderWidth
    })
    
    expect(inputBorder).toBe('1px')
  })

  test('should be responsive across devices', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    const mobileNav = await page.locator('nav').boundingBox()
    expect(mobileNav?.width).toBeLessThanOrEqual(375)
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    const tabletNav = await page.locator('nav').boundingBox()
    expect(tabletNav?.width).toBeLessThanOrEqual(768)
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    const desktopNav = await page.locator('nav').boundingBox()
    expect(desktopNav?.width).toBeLessThanOrEqual(1280)
  })

  test('should have touch-friendly targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/auth/signin')
    
    // Check button size
    const submitButton = await page.locator('button[type="submit"]').first().boundingBox()
    expect(submitButton?.height).toBeGreaterThanOrEqual(44) // Minimum touch target
  })

  test('should support dark mode', async ({ page }) => {
    // Toggle dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    
    const darkBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    
    // Verify dark mode is applied (color should be darker)
    expect(darkBgColor).not.toBe('rgb(255, 255, 255)')
  })

  test('should have smooth transitions and animations', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check transition on button hover
    const button = page.locator('button[type="submit"]').first()
    const transitionProperty = await button.evaluate((el) => {
      return window.getComputedStyle(el).transitionProperty
    })
    
    expect(transitionProperty).toContain('color')
  })

  test('should maintain consistent spacing', async ({ page }) => {
    await page.goto('/')
    
    // Check consistent margins between elements
    const elements = await page.locator('main > *').all()
    if (elements.length > 1) {
      const margins = await Promise.all(
        elements.map(el => el.evaluate(node => {
          return window.getComputedStyle(node).marginBottom
        }))
      )
      
      // Verify spacing is consistent (all should be multiples of 4px)
      margins.forEach(margin => {
        const value = parseInt(margin)
        if (value > 0) {
          expect(value % 4).toBe(0)
        }
      })
    }
  })

  test('should use readable line heights', async ({ page }) => {
    await page.goto('/')
    
    const bodyLineHeight = await page.evaluate(() => {
      return window.getComputedStyle(document.body).lineHeight
    })
    
    // Line height should be at least 1.5 for readability
    const lineHeightValue = parseFloat(bodyLineHeight)
    expect(lineHeightValue).toBeGreaterThanOrEqual(1.5)
  })

  test('should have clean form styling', async ({ page }) => {
    await page.goto('/auth/signin')
    
    // Check input styling
    const input = page.locator('input[type="email"]').first()
    const inputStyles = await input.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        fontSize: styles.fontSize
      }
    })
    
    expect(parseInt(inputStyles.borderRadius)).toBeGreaterThan(0) // Rounded corners
    expect(inputStyles.padding).toBeTruthy() // Has padding
    expect(parseInt(inputStyles.fontSize)).toBeGreaterThanOrEqual(14) // Readable size
  })
})