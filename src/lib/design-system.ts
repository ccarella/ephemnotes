/**
 * Centralized design system for consistent, minimalist UI
 */

// Enhanced color palette
export const colors = {
  background: 'bg-background',
  foreground: 'text-foreground',
  muted: 'text-muted',
  border: 'border-border',
  primary: {
    DEFAULT: 'bg-primary text-white',
    hover: 'hover:bg-primary-hover',
    text: 'text-primary',
  },
  error: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
} as const

// Typography system with improved readability
export const typography = {
  // Headings with better tracking and weight
  h1: 'text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight',
  h2: 'text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight leading-tight',
  h3: 'text-lg sm:text-xl lg:text-2xl font-medium tracking-tight',
  h4: 'text-base sm:text-lg lg:text-xl font-medium',
  
  // Body text with improved line height
  body: {
    DEFAULT: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed',
    small: 'text-sm leading-relaxed',
    xs: 'text-xs',
  },
  
  // Special text styles
  label: 'text-sm font-medium text-foreground',
  muted: 'text-sm text-muted',
  error: 'text-sm text-red-600 dark:text-red-400',
  caption: 'text-xs text-muted',
} as const

// Button styles - minimalist approach
export const buttons = {
  base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  
  variants: {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md',
    secondary: 'bg-transparent border border-border hover:bg-gray-50 dark:hover:bg-gray-900',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  },
  
  sizes: {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 gap-2',
    lg: 'h-11 px-6 gap-2',
    icon: 'h-10 w-10',
  },
} as const

// Form elements - clean and accessible
export const forms = {
  input: 'w-full px-3 py-2 rounded-lg border border-border bg-transparent transition-all duration-200 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20',
  
  textarea: 'w-full px-3 py-2 rounded-lg border border-border bg-transparent transition-all duration-200 placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none',
  
  select: 'w-full px-3 py-2 rounded-lg border border-border bg-transparent transition-all duration-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20',
  
  checkbox: 'h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-2',
  
  radio: 'h-4 w-4 border-border text-primary focus:ring-primary focus:ring-offset-2',
  
  label: 'text-sm font-medium text-foreground',
  
  helper: 'text-xs text-muted mt-1',
  
  error: 'text-xs text-red-600 dark:text-red-400 mt-1',
  
  group: 'space-y-1.5',
  
  fieldset: 'space-y-4',
} as const

// Layout components
export const layout = {
  // Containers
  container: 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8',
  containerNarrow: 'mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8',
  
  // Sections
  section: 'py-12 sm:py-16 lg:py-20',
  sectionTight: 'py-8 sm:py-10 lg:py-12',
  
  // Cards with subtle styling
  card: 'rounded-xl bg-background border border-border p-6 shadow-sm transition-shadow hover:shadow-md',
  cardCompact: 'rounded-lg bg-background border border-border p-4 shadow-sm',
  
  // Modal styling
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fade-in',
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'relative w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-xl animate-fade-in',
    title: 'text-lg font-semibold',
    description: 'text-sm text-muted mt-2',
  },
  
  // Navigation
  nav: {
    container: 'sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-lg',
    content: 'mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8',
    logo: 'text-lg font-semibold',
    link: 'text-sm font-medium text-muted hover:text-foreground transition-colors',
    linkActive: 'text-sm font-medium text-foreground',
  },
} as const

// Spacing system
export const spacing = {
  // Consistent gaps
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
  
  // Stack spacing (vertical)
  stack: {
    xs: 'space-y-2',
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
  
  // Inline spacing (horizontal)
  inline: {
    xs: 'space-x-2',
    sm: 'space-x-3',
    md: 'space-x-4',
    lg: 'space-x-6',
    xl: 'space-x-8',
  },
} as const

// Animation utilities
export const animation = {
  transition: {
    all: 'transition-all duration-200 ease-out',
    colors: 'transition-colors duration-200 ease-out',
    opacity: 'transition-opacity duration-200 ease-out',
    transform: 'transition-transform duration-200 ease-out',
  },
  
  hover: {
    scale: 'hover:scale-[1.02]',
    opacity: 'hover:opacity-80',
    shadow: 'hover:shadow-md',
  },
  
  keyframes: {
    fadeIn: 'animate-fade-in',
    shrink: 'animate-shrink',
  },
} as const

// Utility classes
export const utils = {
  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  
  // Borders
  border: {
    DEFAULT: 'border border-border',
    subtle: 'border border-subtle',
    none: 'border-0',
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    none: 'shadow-none',
  },
  
  // Radius
  radius: {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  },
  
  // Text utilities
  text: {
    truncate: 'truncate',
    nowrap: 'whitespace-nowrap',
    balance: 'text-balance',
  },
} as const

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Export common combinations
export const presets = {
  // Page layouts
  authPage: cn(layout.container, 'min-h-screen flex items-center justify-center py-12'),
  dashboardPage: cn(layout.container, layout.section),
  
  // Common components
  primaryButton: cn(buttons.base, buttons.variants.primary, buttons.sizes.md),
  secondaryButton: cn(buttons.base, buttons.variants.secondary, buttons.sizes.md),
  formField: cn(forms.group),
  textInput: forms.input,
  
  // Typography presets
  pageTitle: typography.h1,
  sectionTitle: typography.h2,
  cardTitle: typography.h3,
  bodyText: typography.body.DEFAULT,
} as const