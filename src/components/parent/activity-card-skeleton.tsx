'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function ActivityCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'featured' | 'compact'
}) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-lg',
        'border-2 border-border/50',
        isFeatured ? 'min-h-90' : ''
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden',
          isCompact ? 'aspect-4/3' : 'aspect-4/3 md:aspect-video'
        )}
      >
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-linear-to-br from-kids-blue/5 via-kids-yellow/5 to-kids-pink/5" />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="absolute right-3 top-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col p-5', isCompact ? 'p-4' : 'p-5')}>
        <div className="space-y-2 mb-3">
          <Skeleton className="h-5 w-[85%] rounded-lg" />
          <Skeleton className="h-5 w-[70%] rounded-lg" />
        </div>

        {!isCompact && (
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-[85%] rounded-md" />
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="ml-auto h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ActivityCardSkeletonGrid({
  count = 6,
  columns = 3,
}: {
  count?: number
  columns?: 1 | 2 | 3
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3'
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ActivityCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function FeaturedActivitySkeletonCarousel({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-5 overflow-hidden pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-full sm:min-w-[320px] sm:max-w-95 shrink-0">
          <ActivityCardSkeleton variant="featured" />
        </div>
      ))}
    </div>
  )
}
