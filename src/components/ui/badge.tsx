import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const variants: Record<string, string> = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-[var(--color-primary)] text-white',
    accent: 'bg-[var(--color-kids-yellow)] text-black',
  }

  return <span data-slot="badge" className={cn(base, variants[variant] ?? variants.default, className)} {...props} />
}

export default Badge
