/**
 * Responsive utility functions and constants
 */

// Breakpoint values matching Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Type-safe breakpoint names
export type Breakpoint = keyof typeof breakpoints

// Check if we're on the server or client
export const isServer = typeof window === 'undefined'

// Get current viewport width (client-side only)
export const getViewportWidth = (): number => {
  if (isServer) return 0
  return window.innerWidth
}

// Get current viewport height (client-side only)
export const getViewportHeight = (): number => {
  if (isServer) return 0
  return window.innerHeight
}

// Check if viewport matches a specific breakpoint
export const matchesBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (isServer) return false
  return window.innerWidth >= breakpoints[breakpoint]
}

// Get current breakpoint
export const getCurrentBreakpoint = (): Breakpoint | 'xs' => {
  if (isServer) return 'xs'
  
  const width = window.innerWidth
  
  if (width >= breakpoints['2xl']) return '2xl'
  if (width >= breakpoints.xl) return 'xl'
  if (width >= breakpoints.lg) return 'lg'
  if (width >= breakpoints.md) return 'md'
  if (width >= breakpoints.sm) return 'sm'
  
  return 'xs'
}

// Check if device has touch support
export const isTouchDevice = (): boolean => {
  if (isServer) return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Safe area insets for devices with notches/home indicators
export const getSafeAreaInsets = () => {
  if (isServer) return { top: 0, right: 0, bottom: 0, left: 0 }
  
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
  }
}

// Responsive container padding based on breakpoint
export const getContainerPadding = (breakpoint: Breakpoint | 'xs' = 'xs') => {
  const paddingMap = {
    xs: '1rem',
    sm: '1.5rem',
    md: '2rem',
    lg: '2rem',
    xl: '2rem',
    '2xl': '2rem',
  }
  
  return paddingMap[breakpoint]
}

// CSS custom properties for safe area insets
export const safeAreaStyles = {
  paddingTop: 'env(safe-area-inset-top)',
  paddingRight: 'env(safe-area-inset-right)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
}

// Navigation constants
export const NAVIGATION = {
  height: 'h-16',
  container: 'flex h-16 items-center justify-between',
  logo: 'text-xl font-bold',
  desktopMenu: 'hidden md:flex md:items-center md:space-x-4',
  mobileMenu: {
    button: 'inline-flex items-center justify-center p-2 md:hidden',
    menu: 'md:hidden',
  },
}

// Spacing constants
export const SPACING = {
  container: {
    maxWidth: 'mx-auto max-w-7xl',
    maxWidthNarrow: 'mx-auto max-w-3xl',
    padding: 'px-4 sm:px-6 lg:px-8',
  },
  component: {
    padding: 'p-4',
    paddingSmall: 'p-3',
    gap: 'space-y-4',
    gapSmall: 'space-y-3',
  },
  section: {
    padding: 'py-8 sm:py-12 lg:py-16',
    paddingSmall: 'py-4 sm:py-6 lg:py-8',
    gapSmall: 'space-y-6',
  },
  form: {
    gap: 'space-y-6',
    inputGap: 'space-y-2',
  },
}

// Touch target sizes
export const TOUCH_TARGETS = {
  button: 'px-4 py-2 min-h-[44px] min-w-[44px]',
  icon: 'p-2 min-h-[44px] min-w-[44px]',
  iconButton: 'p-2 min-h-[44px] min-w-[44px]',
  input: 'px-3 py-2 min-h-[44px]',
  textarea: 'px-3 py-2',
  link: 'cursor-pointer',
}

// Typography constants
export const TYPOGRAPHY = {
  title: {
    xl: 'text-4xl sm:text-5xl font-bold',
    lg: 'text-3xl sm:text-4xl font-bold',
    md: 'text-2xl sm:text-3xl font-bold',
    sm: 'text-xl sm:text-2xl font-semibold',
  },
  heading: {
    h1: 'text-2xl sm:text-3xl font-bold',
    h2: 'text-xl sm:text-2xl font-semibold',
    h3: 'text-lg sm:text-xl font-semibold',
    h4: 'text-base sm:text-lg font-medium',
  },
  body: {
    lg: 'text-lg',
    base: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
    small: 'text-sm',
    large: 'text-lg',
  },
  label: {
    base: 'text-sm font-medium',
  },
  error: 'text-sm text-red-600 dark:text-red-400',
  muted: 'text-sm text-gray-600 dark:text-gray-400',
}

// Modal constants
export const MODAL = {
  overlay: 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
  container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  content: {
    base: 'relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800',
    fullMobile: 'relative w-full h-full sm:h-auto sm:max-w-md',
  },
  padding: 'p-6',
  close: 'absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100',
}

// Layout constants
export const LAYOUT = {
  card: 'rounded-lg border bg-card text-card-foreground shadow-sm',
  section: 'w-full max-w-7xl mx-auto',
  responsiveRow: 'flex flex-col sm:flex-row gap-4',
  grid: {
    base: 'grid gap-4',
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
  },
}