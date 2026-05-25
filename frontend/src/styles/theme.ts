/**
 * Design System - Theme Configuration
 * Defines consistent colors, spacing, typography, and component variants
 */

// Color Palette
export const colors = {
  // Primary - Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Secondary - Slate
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Accent - Emerald
  accent: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  // Neutral
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
}

// Typography Scale
export const typography = {
  // Headings
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-bold tracking-tight',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
  // Body
  body: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  bodyXSmall: 'text-xs leading-relaxed',
  // Labels
  label: 'text-sm font-medium',
  labelSmall: 'text-xs font-medium uppercase tracking-wider',
}

// Spacing Scale
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
}

// Border Radius
export const borderRadius = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

// Shadows
export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

// Container
export const container = 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'
export const containerPadding = 'px-4 sm:px-6 lg:px-8'

// Z-index scale
export const zIndex = {
  hide: '-10',
  base: '0',
  dropdown: '1000',
  sticky: '1100',
  fixed: '1200',
  modal: '1300',
  tooltip: '1400',
}

// Transitions
export const transitions = {
  fast: 'transition-all duration-200',
  base: 'transition-all duration-300',
  slow: 'transition-all duration-500',
}
