'use client'

import { Heart, Home } from 'lucide-react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface HeroSectionProps {
  title: string
  subtitle: string
  icon?: LucideIcon
  className?: string
  children?: ReactNode
}

export function HeroSection({
  title,
  subtitle,
  icon: Icon = Home,
  className,
  children,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl bg-linear-to-br from-kids-blue via-blue-500 to-kids-yellow text-white',
        'px-6 py-10 md:px-10 md:py-12 shadow-xl',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_60%)]" />
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-10 translate-y-10 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.2),transparent_45%)]" />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            Parent Portal
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-base text-white/90 md:text-lg">{subtitle}</p>
          {children ? <div className="mt-6">{children}</div> : null}
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute h-28 w-28 rounded-full bg-white/20 blur-2xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-lg">
            <Icon className="h-11 w-11 text-white" />
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-kids-orange shadow-lg">
              <Heart className="h-5 w-5" />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
