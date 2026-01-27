'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function GuideCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-lg',
        'border-2 border-border/50'
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden',
          isCompact ? 'aspect-[4/3]' : 'aspect-video'
        )}
      >
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-kids-blue/5 via-kids-yellow/5 to-kids-pink/5" />
        <div className="absolute left-3 top-3">
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
        <div className="absolute right-3 top-3">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
        <div className="absolute inset-0 animate-shimmer" />
      </div>

      <div className={cn('flex flex-1 flex-col', isCompact ? 'p-4' : 'p-5')}>
        <div className="space-y-2 mb-3">
          <Skeleton className="h-5 w-[90%] rounded-lg" />
          <Skeleton className="h-5 w-[70%] rounded-lg" />
        </div>

        {!isCompact && (
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-[85%] rounded-md" />
          </div>
        )}

        <div className={cn('flex items-center gap-3', isCompact ? 'mt-auto pt-3' : 'mt-auto pt-2')}>
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex items-center gap-3 ml-auto">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function GuideCardSkeletonGrid({
  count = 6,
  columns = 3,
}: {
  count?: number
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
      {Array.from({ length: count }).map((_, i) => (
        <GuideCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function FeaturedSkeletonCarousel({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-5 overflow-hidden pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[320px] max-w-[360px] flex-shrink-0">
          <GuideCardSkeleton />
        </div>
      ))}
    </div>
  )
}
