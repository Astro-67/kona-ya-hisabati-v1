import { Skeleton } from '@/components/ui/skeleton'

export function GuideCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
