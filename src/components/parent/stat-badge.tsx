'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface StatBadgeProps {
  icon: LucideIcon
  label: string
  className?: string
}

export function StatBadge({ icon: Icon, label, className }: StatBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm',
        className
      )}
    >
      <Icon className="h-4 w-4 text-primary" />
      <span>{label}</span>
    </div>
  )
}
