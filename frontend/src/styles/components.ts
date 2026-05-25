/**
 * Component Variants - Reusable Tailwind class combinations
 */

export const buttonVariants = {
  // Primary Button
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 disabled:cursor-not-allowed',
  // Secondary Button
  secondary:
    'bg-slate-200 hover:bg-slate-300 text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed',
  // Ghost Button
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed',
  // Danger Button
  danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400 disabled:cursor-not-allowed',
}

export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const buttonBase =
  'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center justify-center gap-2'

export const inputBase =
  'w-full px-4 py-2.5 border border-slate-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed'

export const inputError = 'border-red-500 focus:border-red-500 focus:ring-red-500/10'

export const cardBase =
  'bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'

export const badgeBase = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium'

export const badgeVariants = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-slate-100 text-slate-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
}
