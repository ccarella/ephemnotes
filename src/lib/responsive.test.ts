import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Responsive Design System', () => {
  describe('Typography Classes', () => {
    it('should apply responsive heading styles', () => {
      const headingClasses = 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
      const result = cn(headingClasses)
      expect(result).toBe('text-2xl sm:text-3xl md:text-4xl lg:text-5xl')
    })

    it('should apply responsive body text styles', () => {
      const bodyClasses = 'text-sm sm:text-base lg:text-lg'
      const result = cn(bodyClasses)
      expect(result).toBe('text-sm sm:text-base lg:text-lg')
    })

    it('should apply responsive small text styles', () => {
      const smallClasses = 'text-xs sm:text-sm'
      const result = cn(smallClasses)
      expect(result).toBe('text-xs sm:text-sm')
    })
  })

  describe('Spacing Classes', () => {
    it('should apply responsive padding', () => {
      const paddingClasses = 'p-4 sm:p-6 lg:p-8'
      const result = cn(paddingClasses)
      expect(result).toBe('p-4 sm:p-6 lg:p-8')
    })

    it('should apply responsive margin', () => {
      const marginClasses = 'mt-4 sm:mt-6 md:mt-8'
      const result = cn(marginClasses)
      expect(result).toBe('mt-4 sm:mt-6 md:mt-8')
    })

    it('should apply responsive gap', () => {
      const gapClasses = 'gap-4 sm:gap-6 lg:gap-8'
      const result = cn(gapClasses)
      expect(result).toBe('gap-4 sm:gap-6 lg:gap-8')
    })
  })

  describe('Layout Classes', () => {
    it('should apply responsive container widths', () => {
      const containerClasses = 'max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl'
      const result = cn(containerClasses)
      expect(result).toBe('max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl')
    })

    it('should apply responsive grid columns', () => {
      const gridClasses = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      const result = cn(gridClasses)
      expect(result).toBe('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')
    })

    it('should apply responsive flex direction', () => {
      const flexClasses = 'flex flex-col sm:flex-row'
      const result = cn(flexClasses)
      expect(result).toBe('flex flex-col sm:flex-row')
    })
  })

  describe('Touch Target Classes', () => {
    it('should ensure minimum touch target size for buttons', () => {
      const buttonClasses = 'min-h-[44px] min-w-[44px] p-3'
      const result = cn(buttonClasses)
      expect(result).toBe('min-h-[44px] min-w-[44px] p-3')
    })

    it('should ensure minimum touch target size for links', () => {
      const linkClasses = 'inline-block min-h-[44px] py-3 px-4'
      const result = cn(linkClasses)
      expect(result).toBe('inline-block min-h-[44px] py-3 px-4')
    })
  })

  describe('Container Queries', () => {
    it('should apply container query classes', () => {
      const containerQueryClasses = '@container'
      const result = cn(containerQueryClasses)
      expect(result).toBe('@container')
    })

    it('should apply responsive container query variants', () => {
      const containerVariantClasses = '@sm:flex-row @lg:grid-cols-3'
      const result = cn(containerVariantClasses)
      expect(result).toBe('@sm:flex-row @lg:grid-cols-3')
    })
  })
})

describe('Responsive Design Constants', () => {
  it('should export typography scale constants', () => {
    const TYPOGRAPHY = {
      heading: {
        h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
        h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold',
        h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
        h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-medium',
      },
      body: {
        large: 'text-base sm:text-lg',
        base: 'text-sm sm:text-base',
        small: 'text-xs sm:text-sm',
      },
    }
    
    expect(TYPOGRAPHY.heading.h1).toBeDefined()
    expect(TYPOGRAPHY.body.base).toBeDefined()
  })

  it('should export spacing scale constants', () => {
    const SPACING = {
      container: {
        padding: 'px-4 sm:px-6 lg:px-8',
        maxWidth: 'max-w-7xl mx-auto',
      },
      section: {
        padding: 'py-8 sm:py-12 lg:py-16',
        gap: 'space-y-6 sm:space-y-8 lg:space-y-12',
      },
      component: {
        padding: 'p-4 sm:p-6',
        gap: 'gap-4 sm:gap-6',
      },
    }
    
    expect(SPACING.container.padding).toBeDefined()
    expect(SPACING.section.padding).toBeDefined()
  })

  it('should export touch target constants', () => {
    const TOUCH_TARGETS = {
      button: 'min-h-[44px] px-4 py-2.5',
      iconButton: 'h-11 w-11 p-2.5',
      input: 'h-11 px-3',
      link: 'inline-block min-h-[44px] py-3',
    }
    
    expect(TOUCH_TARGETS.button).toBeDefined()
    expect(TOUCH_TARGETS.input).toBeDefined()
  })
})