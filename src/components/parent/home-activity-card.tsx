'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Home,
  Package,
  Sparkles,
} from 'lucide-react'

import type { CategoryDetail, HomeActivity } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const difficultyStyles: Record<HomeActivity['difficulty'], string> = {
  easy: 'bg-green-100 text-green-800 border border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  hard: 'bg-red-100 text-red-800 border border-red-300',
}

const difficultyLabels: Record<HomeActivity['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export interface HomeActivityCardProps {
  activity: HomeActivity
  isCompleted?: boolean
  onClick: () => void
  variant?: 'default' | 'featured' | 'compact'
  className?: string
}

const fallbackCategoryDetail: CategoryDetail = {
  id: 0,
  name: 'Activity',
  slug: 'activity',
  icon: '',
  color: 'var(--color-kids-blue)',
}

export function HomeActivityCard({
  activity,
  isCompleted = false,
  onClick,
  variant = 'default',
  className,
}: HomeActivityCardProps) {
  const safeActivity = activity as Partial<HomeActivity>
  const [imageError, setImageError] = useState(false)
  const thumbnail = (safeActivity.thumbnail ?? '').trim()
  const showImage = Boolean(thumbnail) && !imageError
  const isCompact = variant === 'compact'

  const categoryDetail =
    safeActivity.category_detail ?? fallbackCategoryDetail
  const categoryColor = categoryDetail.color
  const categoryName = categoryDetail.name

  const materialsCount = Array.isArray(safeActivity.materials_needed)
    ? safeActivity.materials_needed.length
    : typeof safeActivity.materials_needed === 'string'
      ? safeActivity.materials_needed
          .split(/\r?\n|,/)
          .filter((item: string) => item.trim()).length
      : 0
  const durationLabel = activity.duration_minutes
    ? `${activity.duration_minutes} min`
    : 'Flexible'
  const description = (safeActivity.description ?? '').trim()
  const descriptionText =
    description.length > 0
      ? description
      : 'Create a special learning moment together at home.'

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`View activity: ${activity.title}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card cursor-pointer',
        'border-2 border-transparent shadow-lg transition-all duration-200 ease-out',
        'hover:shadow-lg hover:scale-105 hover:-translate-y-1 hover:border-primary/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        variant === 'featured' ? 'min-h-90' : '',
        className
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden',
          isCompact ? 'aspect-4/3' : 'aspect-4/3 md:aspect-video'
        )}
      >
        {showImage ? (
          <>
            <img
              src={thumbnail || '/placeholder.svg'}
              alt={activity.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-kids-blue/30 via-kids-yellow/30 to-kids-green/30">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/30 backdrop-blur-sm">
                <Home className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {activity.is_featured && (
            <Badge className="gap-1.5 rounded-full bg-kids-yellow text-secondary-foreground border-0 px-3 py-1.5 shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Featured
            </Badge>
          )}
          <Badge
            className="rounded-full border px-3 py-1.5 text-xs font-bold shadow-md"
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
              borderColor: `${categoryColor}40`,
            }}
          >
            {categoryName}
          </Badge>
        </div>

        <div className="absolute right-3 top-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold shadow-md',
              difficultyStyles[activity.difficulty]
            )}
          >
            {difficultyLabels[activity.difficulty]}
          </span>
        </div>

        {isCompleted && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-success/95 px-3 py-1.5 text-xs font-semibold text-success-foreground shadow-lg">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
        )}
      </div>

      <div className={cn('flex flex-1 flex-col p-5', isCompact ? 'p-4' : 'p-5')}>
        <h3
          className={cn(
            'font-bold text-foreground leading-snug transition-colors group-hover:text-primary',
            isCompact ? 'text-base line-clamp-2' : 'text-lg line-clamp-2 mb-2'
          )}
        >
          {activity.title}
        </h3>

        {!isCompact && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
            {descriptionText}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" />
            {durationLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <Package className="h-4 w-4" />
            {materialsCount} material{materialsCount === 1 ? '' : 's'}
          </span>

          <Button
            type="button"
            size="sm"
            className="ml-auto rounded-xl"
            onClick={(event) => {
              event.stopPropagation()
              onClick()
            }}
          >
            View Details
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-kids-blue/20 via-kids-yellow/20 to-kids-orange/20" />
      </div>
    </article>
  )
}
