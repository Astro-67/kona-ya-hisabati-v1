import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Home,
  Lightbulb,
  ListOrdered,
  Package,
  Target,
  Users,
  Video,
} from 'lucide-react'
import type { ReactNode } from 'react'

import type { HomeActivity } from '@/types'
import { apiClient } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorMessage } from '@/components/ui/error-message'
import { ActivityCardSkeletonGrid } from '@/components/parent/activity-card-skeleton'
import { HomeActivityCard } from '@/components/parent/home-activity-card'
import { StatBadge } from '@/components/parent/stat-badge'

export const Route = createFileRoute('/parent/home-activities/$activityId')({
  component: HomeActivityDetail,
})

const ageGroupLabels: Record<HomeActivity['age_group'], string> = {
  pre_primary: 'Pre-Primary',
  standard_1: 'Standard 1',
  standard_2: 'Standard 2',
  all: 'All Ages',
}

const difficultyLabels: Record<HomeActivity['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const extractCompletedIds = (data: unknown): Array<number> => {
  if (!data) return []

  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === 'number') return item
        if (item && typeof item === 'object') {
          const typed = item as { id?: number; activity_id?: number }
          if (typeof typed.id === 'number') return typed.id
          if (typeof typed.activity_id === 'number') return typed.activity_id
        }
        return null
      })
      .filter((value): value is number => typeof value === 'number')
  }

  if (typeof data === 'object') {
    const results = (data as { results?: unknown }).results
    return extractCompletedIds(results)
  }

  return []
}

const isVideoFile = (url: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(url)

const getYouTubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    return url
  } catch {
    return url
  }
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof Lightbulb
  children: ReactNode
}) {
  return (
    <Card className="rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div>{children}</div>
    </Card>
  )
}

function HomeActivityDetail() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { activityId } = Route.useParams()
  const [imageError, setImageError] = useState(false)

  const {
    data: activity,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['home-activity', activityId],
    enabled: Boolean(activityId),
    queryFn: async () => {
      const res = await apiClient.get(`/parent/home-activities/${activityId}/`)
      return res.data as HomeActivity
    },
  })

  const { data: completedActivitiesData } = useQuery({
    queryKey: ['completed-home-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/parent/home-activities/completed/')
      return res.data
    },
  })

  const { data: relatedActivities, isLoading: relatedLoading } = useQuery({
    queryKey: ['home-activity-related', activity?.category],
    enabled: Boolean(activity?.category),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activity?.category) params.append('category', String(activity.category))
      params.append('page', '1')
      const res = await apiClient.get(`/parent/home-activities/?${params.toString()}`)
      const data = res.data
      if (Array.isArray(data)) return data
      return Array.isArray(data?.results) ? data.results : []
    },
  })

  const completeMutation = useMutation({
    mutationFn: async (id: number) =>
      apiClient.post('/parent/home-activities/complete/', {
        activity_id: id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-activities'] })
      queryClient.invalidateQueries({ queryKey: ['completed-home-activities'] })
      queryClient.invalidateQueries({ queryKey: ['featured-home-activities'] })
      toast.success('Activity marked as completed!')
    },
    onError: (mutationError) => {
      toast.error(
        (mutationError as { message?: string }).message ||
          'Unable to mark activity as completed.'
      )
    },
  })

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as { message?: string }).message ||
          'Failed to load the activity.'
      )
    }
  }, [isError, error])

  const completedIds = useMemo(
    () => new Set(extractCompletedIds(completedActivitiesData)),
    [completedActivitiesData]
  )

  const isCompleted = activity ? completedIds.has(activity.id) : false

  const steps = useMemo(() => {
    if (!activity?.instructions) return []
    return activity.instructions
      .split(/\r?\n/)
      .map((step) => step.trim())
      .filter(Boolean)
  }, [activity?.instructions])

  const materials = activity?.materials_needed ?? []
  const objectives = activity?.learning_objectives ?? []
  const tips = activity?.tips ?? []
  const durationLabel = activity?.duration_minutes
    ? `${activity.duration_minutes} min`
    : 'Flexible'
  const completionCount = activity?.completion_count ?? 0
  const categoryDetail = activity?.category_detail ?? null
  const categoryColor = categoryDetail?.color ?? 'var(--color-kids-blue)'

  return (
    <div className="min-h-screen bg-kids-bg/40">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 gap-2"
          onClick={() => navigate({ to: '/parent/home-activities' })}
          aria-label="Back to activities"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Activities
        </Button>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-64 rounded-3xl bg-muted/40 animate-pulse" />
            <div className="h-6 w-2/3 rounded bg-muted/40 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-muted/40 animate-pulse" />
          </div>
        ) : isError || !activity ? (
          <ErrorMessage message="We couldn't load this activity." onRetry={() => refetch()} />
        ) : (
          <div className="space-y-8">
            <Card className="overflow-hidden rounded-3xl border border-border p-0">
              <div className="relative h-64 sm:h-72">
                {activity.thumbnail && !imageError ? (
                  <img
                    src={activity.thumbnail}
                    alt={activity.title}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-kids-blue/30 via-kids-yellow/30 to-kids-green/30">
                    <Home className="h-12 w-12 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <h1 className="text-3xl font-bold text-white">{activity.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {categoryDetail?.name ? (
                      <Badge
                        className="border"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                          borderColor: `${categoryColor}40`,
                        }}
                      >
                        {categoryDetail.name}
                      </Badge>
                    ) : null}
                    <Badge className="border border-white/30 bg-white/10 text-white">
                      {difficultyLabels[activity.difficulty]}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              <StatBadge icon={Clock} label={durationLabel} />
              <StatBadge icon={Target} label={difficultyLabels[activity.difficulty]} />
              <StatBadge icon={Users} label={ageGroupLabels[activity.age_group]} />
              <StatBadge icon={CheckCircle2} label={`${completionCount} completed`} />
            </div>

            <Card className="rounded-2xl border border-border p-6">
              <p className="text-lg text-foreground">{activity.description}</p>
            </Card>

            <Section title="Materials Needed" icon={Package}>
              {materials.length > 0 ? (
                <ul className="space-y-2">
                  {materials.map((material, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No special materials needed for this activity.</p>
              )}
            </Section>

            <Section title="What Your Child Will Learn" icon={Target}>
              {objectives.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2">
                  {objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ol>
              ) : (
                <p>Learning objectives will be added soon.</p>
              )}
            </Section>

            <Section title="Step-by-Step Instructions" icon={ListOrdered}>
              {steps.length > 0 ? (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Detailed instructions will be available soon.</p>
              )}
            </Section>

            {tips.length > 0 ? (
              <Section title="Tips for Parents" icon={Lightbulb}>
                <div className="rounded-xl border border-kids-yellow/40 bg-kids-yellow/10 p-4 text-foreground">
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index}>Tip: {tip}</li>
                    ))}
                  </ul>
                </div>
              </Section>
            ) : null}

            {activity.video_url ? (
              <Section title="Video Tutorial" icon={Video}>
                {isVideoFile(activity.video_url) ? (
                  <video className="w-full rounded-2xl" controls preload="metadata">
                    <source src={activity.video_url} />
                  </video>
                ) : (
                  <iframe
                    src={getYouTubeEmbedUrl(activity.video_url)}
                    className="w-full aspect-video rounded-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${activity.title} video`}
                  />
                )}
              </Section>
            ) : null}

            <div className="sticky bottom-4 z-10">
              <Card className="rounded-2xl border border-border p-4 shadow-lg">
                <Button
                  size="lg"
                  className="w-full"
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  onClick={() => activity && completeMutation.mutate(activity.id)}
                  disabled={isCompleted || completeMutation.isPending}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Completed
                    </>
                  ) : completeMutation.isPending ? (
                    'Marking...'
                  ) : (
                    'Mark as Completed'
                  )}
                </Button>
              </Card>
            </div>

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-foreground">Related Activities</h2>

              {relatedLoading ? (
                <ActivityCardSkeletonGrid count={3} columns={3} />
              ) : relatedActivities && relatedActivities.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedActivities
                    .filter((item: HomeActivity) => item.id !== activity.id)
                    .slice(0, 3)
                    .map((item: HomeActivity) => (
                      <HomeActivityCard
                        key={item.id}
                        activity={item}
                        variant="compact"
                        isCompleted={
                          completedIds.has(item.id) ||
                          Boolean((item as { completed?: boolean }).completed)
                        }
                        onClick={() =>
                          navigate({
                            to: '/parent/home-activities/$activityId',
                            params: { activityId: String(item.id) },
                          })
                        }
                      />
                    ))}
                </div>
              ) : (
                <EmptyState
                  title="No related activities"
                  description="Check back later for more activities in this category."
                  className="rounded-xl border border-dashed border-border bg-muted/30"
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
