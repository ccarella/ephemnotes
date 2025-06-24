/**
 * Minimal design system inspired by iA Writer
 * Focus on typography, readability, and distraction-free writing
 */

// Minimal color palette
export const colors = {
  text: {
    primary: 'text-foreground',
    secondary: 'text-secondary',
    muted: 'text-muted',
    link: 'text-link',
  },
  background: {
    primary: 'bg-background',
    secondary: 'bg-background-secondary',
  },
  border: {
    DEFAULT: 'border-border',
    light: 'border-border-light',
  },
} as const

// Typography system optimized for reading and writing
export const typography = {
  // Document title
  title: 'text-3xl font-bold leading-tight tracking-tight',
  
  // Section headings
  h1: 'text-2xl font-bold leading-tight',
  h2: 'text-xl font-semibold leading-snug',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  
  // Body text with optimal line height
  body: {
    DEFAULT: 'text-base leading-[1.8]',
    large: 'text-lg leading-[1.8]',
    small: 'text-sm leading-[1.7]',
  },
  
  // UI text
  ui: {
    DEFAULT: 'text-sm',
    small: 'text-xs',
    tiny: 'text-[11px]',
  },
  
  // Special styles
  meta: 'text-xs text-muted uppercase tracking-wide',
  caption: 'text-sm text-secondary',
  
  // Writing mode
  writing: 'font-writing text-lg leading-[1.9] tracking-[0.01em]',
} as const

// Minimal button styles
export const buttons = {
  base: 'inline-flex items-center justify-center font-medium transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-3 disabled:opacity-50 disabled:cursor-not-allowed active:transform active:translate-y-px',
  
  variants: {
    primary: 'bg-foreground text-background hover:opacity-85',
    secondary: 'bg-transparent text-foreground border border-border hover:bg-background-secondary',
    ghost: 'text-secondary hover:text-foreground hover:bg-background-secondary',
    text: 'text-link hover:text-foreground',
  },
  
  sizes: {
    sm: 'h-8 px-3 text-xs rounded',
    md: 'h-9 px-4 text-sm rounded',
    lg: 'h-10 px-6 text-base rounded',
  },
} as const

// Clean form elements
export const forms = {
  input: 'w-full bg-background border border-border rounded px-3 py-2 text-base transition-colors duration-200 placeholder:text-muted focus:border-focus focus:outline-none',
  
  textarea: 'w-full bg-background border border-border rounded px-3 py-2 text-base leading-[1.8] transition-colors duration-200 placeholder:text-muted focus:border-focus focus:outline-none resize-vertical min-h-[120px]',
  
  select: 'w-full bg-background border border-border rounded px-3 py-2 text-base transition-colors duration-200 focus:border-focus focus:outline-none appearance-none',
  
  label: 'block text-sm font-medium mb-1.5',
  
  helper: 'text-xs text-secondary mt-1',
  
  error: 'text-xs text-red-600 mt-1',
} as const

// Layout components
export const layout = {
  // Content containers
  container: 'content-container',
  wide: 'max-w-5xl mx-auto px-6',
  
  // Page layouts
  page: 'min-h-screen bg-background',
  centered: 'min-h-screen flex items-center justify-center px-4',
  
  // Content sections
  section: 'py-12',
  prose: 'prose prose-lg max-w-none',
  
  // Cards - minimal style
  card: 'bg-background border border-border-light rounded p-6 transition-colors hover:border-border',
  
  // Navigation
  nav: {
    container: 'sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border-light',
    content: 'content-container flex items-center justify-between h-14',
    link: 'text-sm text-secondary hover:text-foreground transition-colors no-underline',
    linkActive: 'text-sm text-foreground font-medium no-underline',
  },
  
  // Modals
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/10 backdrop-blur-sm',
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'relative w-full max-w-lg bg-background border border-border rounded-lg p-8 shadow-sm',
  },
} as const

// Spacing system
export const spacing = {
  // Content spacing
  paragraph: 'mb-6',
  section: 'mb-12',
  
  // UI spacing
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
  
  stack: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  },
} as const

// Utility classes
export const utils = {
  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-3',
  
  // Text utilities
  truncate: 'truncate',
  nowrap: 'whitespace-nowrap',
  
  // Writing focus mode
  focusMode: 'focus-mode',
  writingMode: 'writing-mode',
  
  // Transitions
  transition: 'transition-colors duration-200',
} as const

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Common presets
export const presets = {
  // Buttons
  primaryButton: cn(buttons.base, buttons.variants.primary, buttons.sizes.md),
  secondaryButton: cn(buttons.base, buttons.variants.secondary, buttons.sizes.md),
  ghostButton: cn(buttons.base, buttons.variants.ghost, buttons.sizes.md),
  
  // Forms
  textInput: forms.input,
  textArea: forms.textarea,
  
  // Typography
  pageTitle: typography.title,
  sectionTitle: typography.h1,
  bodyText: typography.body.DEFAULT,
  
  // Pages
  authPage: cn(layout.page, layout.centered),
  contentPage: cn(layout.page, layout.container, 'py-8'),
} as const