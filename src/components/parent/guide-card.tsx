import { useState } from 'react'
import { BookOpen, Clock, Eye, Home, Sparkles, Video } from 'lucide-react'

import type { ParentGuide } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const resourceTypeConfig = {
  text_guide: {
    label: 'Guide',
    icon: BookOpen,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  video_tutorial: {
    label: 'Video',
    icon: Video,
    className: 'bg-kids-orange/15 text-accent border-accent/30',
  },
  offline_activity: {
    label: 'Activity',
    icon: Home,
    className: 'bg-success/15 text-success border-success/30',
  },
}

const ageGroupLabels: Record<ParentGuide['age_group'], string> = {
  pre_primary: 'Pre-Primary',
  standard_1: 'Standard 1',
  standard_2: 'Standard 2',
  all: 'All Ages',
}

export interface GuideCardProps {
  guide: ParentGuide
  onClick: () => void
}

export function GuideCard({ guide, onClick }: GuideCardProps) {
  const [imageError, setImageError] = useState(false)
  const resource = resourceTypeConfig[guide.resource_type]
  const ResourceIcon = resource.icon
  const showImage = Boolean(guide.thumbnail) && !imageError

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Open guide ${guide.title}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-0 gap-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative h-40 w-full overflow-hidden">
        {showImage ? (
          <img
            src={guide.thumbnail}
            alt={guide.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 via-secondary/20 to-accent/20">
            <ResourceIcon className="h-10 w-10 text-primary/70" />
          </div>
        )}

        <Badge
          className={cn(
            'absolute right-3 top-3 flex items-center gap-1 border px-2 py-1 text-xs font-semibold shadow-sm',
            resource.className
          )}
        >
          <ResourceIcon className="h-3.5 w-3.5" />
          {resource.label}
        </Badge>

        {guide.is_featured && (
          <Badge className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
            Featured
          </Badge>
        )}
      </div>

      <div className="flex h-full flex-col gap-3 p-4">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-base font-bold text-foreground">
            {guide.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {guide.description || 'No description available yet.'}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge className="border border-primary/30 bg-transparent text-primary">
            {ageGroupLabels[guide.age_group]}
          </Badge>

          {guide.duration_minutes ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {guide.duration_minutes} min
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {guide.view_count ?? 0}
          </span>
        </div>
      </div>
    </Card>
  )
}
