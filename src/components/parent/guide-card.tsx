'use client'

import { useState, type ReactNode } from 'react'
import {
  BookOpen,
  Clock,
  Eye,
  Home,
  Play,
  Sparkles,
  Video,
} from 'lucide-react'

import type { ParentGuide } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const resourceTypeConfig = {
  text_guide: {
    label: 'Guide',
    icon: BookOpen,
    gradient: 'from-kids-blue to-blue-600',
    bg: 'bg-kids-blue',
  },
  video_tutorial: {
    label: 'Video',
    icon: Video,
    gradient: 'from-kids-orange to-orange-600',
    bg: 'bg-kids-orange',
  },
  offline_activity: {
    label: 'Activity',
    icon: Home,
    gradient: 'from-kids-green to-green-600',
    bg: 'bg-kids-green',
  },
}

const ageGroupLabels: Record<ParentGuide['age_group'], string> = {
  pre_primary: 'Ages 3-5',
  standard_1: 'Ages 6-7',
  standard_2: 'Ages 7-8',
  all: 'All Ages',
}

const ageGroupColors: Record<ParentGuide['age_group'], string> = {
  pre_primary: 'bg-kids-pink text-white',
  standard_1: 'bg-kids-blue text-white',
  standard_2: 'bg-kids-green text-white',
  all: 'bg-kids-yellow text-secondary-foreground',
}

export interface GuideCardProps {
  guide: ParentGuide
  onClick: () => void
  variant?: 'default' | 'featured' | 'compact'
}

export function GuideCard({ guide, onClick, variant = 'default' }: GuideCardProps) {
  const [imageError, setImageError] = useState(false)
  const resource = resourceTypeConfig[guide.resource_type]
  const ResourceIcon = resource.icon
  const thumbnail = guide.thumbnail?.trim() || ''
  const showImage = Boolean(thumbnail) && !imageError
  const isVideo = guide.resource_type === 'video_tutorial'

  const isFeatured = variant === 'featured' || guide.is_featured
  const isCompact = variant === 'compact'

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Open guide: ${guide.title}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl bg-card cursor-pointer',
        'border-2 border-transparent shadow-lg',
        'transition-all duration-300 ease-out',
        'hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isCompact ? 'h-full' : ''
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden',
          isCompact ? 'aspect-[4/3]' : 'aspect-video'
        )}
      >
        {showImage ? (
          <>
            <img
              src={thumbnail || '/placeholder.svg'}
              alt={guide.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center',
              'bg-gradient-to-br',
              resource.gradient
            )}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl scale-150" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <ResourceIcon className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        )}

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110">
              <Play className="h-7 w-7 text-kids-orange ml-1" fill="currentColor" />
            </div>
          </div>
        )}

        <Badge
          className={cn(
            'absolute left-3 top-3 flex items-center gap-1.5 px-3 py-1.5',
            'rounded-full text-xs font-bold shadow-lg border-0',
            resource.bg,
            'text-white'
          )}
        >
          <ResourceIcon className="h-3.5 w-3.5" />
          {resource.label}
        </Badge>

        {isFeatured && (
          <Badge className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-kids-yellow text-secondary-foreground shadow-lg border-0 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-bold text-xs">Featured</span>
          </Badge>
        )}

        {isVideo && guide.duration_minutes ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/70 px-2.5 py-1 text-white text-xs font-semibold backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            {guide.duration_minutes} min
          </div>
        ) : null}
      </div>

      <div className={cn('flex flex-1 flex-col p-5', isCompact ? 'p-4' : 'p-5')}>
        <h3
          className={cn(
            'font-bold text-foreground leading-snug transition-colors group-hover:text-primary',
            isCompact ? 'text-base line-clamp-2' : 'text-lg line-clamp-2 mb-2'
          )}
        >
          {guide.title}
        </h3>

        {!isCompact && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {guide.description || 'Discover helpful tips and activities for your child.'}
          </p>
        )}

        <div
          className={cn(
            'flex flex-wrap items-center gap-2',
            isCompact ? 'mt-auto pt-3' : 'mt-auto pt-2'
          )}
        >
          <Badge
            className={cn(
              'rounded-full text-xs font-bold border-0 px-3 py-1',
              ageGroupColors[guide.age_group]
            )}
          >
            {ageGroupLabels[guide.age_group]}
          </Badge>

          <div className="flex items-center gap-3 ml-auto text-xs text-muted-foreground">
            {!isVideo && guide.duration_minutes ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {guide.duration_minutes}m
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {guide.view_count > 999
                ? `${(guide.view_count / 1000).toFixed(1)}k`
                : guide.view_count}
            </span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          className={cn(
            'absolute inset-0 rounded-3xl bg-gradient-to-r opacity-10',
            resource.gradient
          )}
        />
      </div>
    </article>
  )
}

export function GuideCardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode
  columns?: 2 | 3 | 4
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      )}
    >
      {children}
    </div>
  )
}
