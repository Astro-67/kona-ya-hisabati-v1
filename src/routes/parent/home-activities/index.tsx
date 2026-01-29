import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { CategoryDetail, HomeActivity, PaginatedResponse } from '@/types'
import type {FilterState} from '@/components/parent/home-activities-filter';
import { apiClient } from '@/lib/api'
import { toast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorMessage } from '@/components/ui/error-message'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HeroSection } from '@/components/parent/hero-section'
import { HomeActivityCard } from '@/components/parent/home-activity-card'
import {
  ActivityCardSkeletonGrid,
  FeaturedActivitySkeletonCarousel,
} from '@/components/parent/activity-card-skeleton'
import {  HomeActivitiesFilter } from '@/components/parent/home-activities-filter'
import { FeaturedActivitiesCarousel } from '@/components/parent/featured-activities-carousel'

export const Route = createFileRoute('/parent/home-activities/')({
  component: HomeActivitiesList,
})

const normalizePaginatedActivities = (data: unknown): PaginatedResponse<HomeActivity> => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as Array<HomeActivity>,
    }
  }

  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as PaginatedResponse<HomeActivity>).results)
  ) {
    return data as PaginatedResponse<HomeActivity>
  }

  return { count: 0, next: null, previous: null, results: [] }
}

const normalizeActivityList = (data: unknown): Array<HomeActivity> => {
  if (!data) return []

  if (Array.isArray(data)) {
    if (data.length === 0) return []
    if (typeof data[0] === 'number') return []
    return data as Array<HomeActivity>
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof data === 'object' && data) {
    const results = (data as { results?: unknown }).results
    if (Array.isArray(results)) {
      return normalizeActivityList(results)
    }
  }

  return []
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

const applyFilters = (activities: Array<HomeActivity>, filters: FilterState) =>
  activities.filter((activity) => {
    if (filters.ageGroup && activity.age_group !== filters.ageGroup) return false
    if (filters.difficulty && activity.difficulty !== filters.difficulty) return false
    if (filters.category && activity.category !== filters.category) return false
    return true
  })

function HomeActivitiesList() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'duration'>('all')
  const [filters, setFilters] = useState<FilterState>({
    ageGroup: '',
    difficulty: '',
    category: null,
  })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.ageGroup, filters.difficulty, filters.category, activeTab])

  const params = useMemo(() => {
    const searchParams = new URLSearchParams()
    if (filters.ageGroup) searchParams.append('age_group', filters.ageGroup)
    if (filters.difficulty) searchParams.append('difficulty', filters.difficulty)
    if (filters.category) searchParams.append('category', String(filters.category))
    searchParams.append('page', String(currentPage))
    return searchParams.toString()
  }, [filters.ageGroup, filters.category, filters.difficulty, currentPage])

  const {
    data: activitiesResponse,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['home-activities', filters, currentPage, activeTab],
    queryFn: async () => {
      const res = await apiClient.get(`/parent/home-activities/?${params}`)
      return normalizePaginatedActivities(res.data)
    },
    placeholderData: keepPreviousData,
  })

  const {
    data: featuredActivities,
    isLoading: featuredLoading,
    isError: featuredError,
    error: featuredErrorData,
  } = useQuery({
    queryKey: ['featured-home-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/parent/home-activities/featured/')
      return Array.isArray(res.data) ? res.data : []
    },
  })

  const {
    data: completedActivitiesData,
    isLoading: completedLoading,
    isError: completedError,
    error: completedErrorData,
  } = useQuery({
    queryKey: ['completed-home-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/parent/home-activities/completed/')
      return res.data
    },
  })

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as { message?: string }).message ||
          'Failed to load home activities.'
      )
    }
  }, [isError, error])

  useEffect(() => {
    if (featuredError) {
      toast.error(
        (featuredErrorData as { message?: string }).message ||
          'Failed to load featured activities.'
      )
    }
  }, [featuredError, featuredErrorData])

  useEffect(() => {
    if (completedError) {
      toast.error(
        (completedErrorData as { message?: string }).message ||
          'Failed to load completed activities.'
      )
    }
  }, [completedError, completedErrorData])

  const activities = activitiesResponse?.results ?? []
  const completedIds = useMemo(
    () => new Set(extractCompletedIds(completedActivitiesData)),
    [completedActivitiesData]
  )
  const completedList = useMemo(() => {
    const list = normalizeActivityList(completedActivitiesData)
    if (list.length > 0) return list
    if (completedIds.size === 0) return []
    return activities.filter((activity) => completedIds.has(activity.id))
  }, [activities, completedActivitiesData, completedIds])

  const filteredActivities = useMemo(
    () => applyFilters(activities, filters),
    [activities, filters]
  )
  const filteredCompleted = useMemo(
    () => applyFilters(completedList, filters),
    [completedList, filters]
  )

  const durationGroups = useMemo(() => {
    const sorted = [...filteredActivities].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const aDuration = a.duration_minutes ?? 0
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const bDuration = b.duration_minutes ?? 0
      return aDuration - bDuration
    })

    const quick: Array<HomeActivity> = []
    const medium: Array<HomeActivity> = []
    const long: Array<HomeActivity> = []

    sorted.forEach((activity) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const duration = activity.duration_minutes ?? 0
      if (duration < 15) {
        quick.push(activity)
      } else if (duration <= 30) {
        medium.push(activity)
      } else {
        long.push(activity)
      }
    })

    return { quick, medium, long }
  }, [filteredActivities])

  const categories = useMemo(() => {
    const map = new Map<number, CategoryDetail>()
    const sources = [
      ...activities,
      ...(featuredActivities ?? []),
      ...completedList,
    ]

    sources.forEach((activity) => {
      const categoryDetail = activity?.category_detail ?? null
      if (categoryDetail?.id) {
        map.set(categoryDetail.id, categoryDetail)
      }
    })

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [activities, featuredActivities, completedList])

  const totalCount = activitiesResponse?.count ?? activities.length
  const pageSize = activities.length || 1
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const showPagination = totalPages > 1 && activeTab !== 'completed'

  const handleNavigate = (activityId: number) => {
    navigate({
      to: '/parent/home-activities/$activityId',
      params: { activityId: String(activityId) },
    })
  }

  const renderActivitiesGrid = (items: Array<HomeActivity>) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((activity) => (
        <HomeActivityCard
          key={activity.id}
          activity={activity}
          isCompleted={
            completedIds.has(activity.id) || Boolean((activity as { completed?: boolean }).completed)
          }
          onClick={() => handleNavigate(activity.id)}
        />
      ))}
    </div>
  )

  const durationSections = [
    {
      id: 'quick',
      label: 'Quick (< 15 min)',
      items: durationGroups.quick,
    },
    {
      id: 'medium',
      label: 'Medium (15-30 min)',
      items: durationGroups.medium,
    },
    {
      id: 'long',
      label: 'Long (30+ min)',
      items: durationGroups.long,
    },
  ]

  return (
    <div className="min-h-screen bg-kids-bg/40">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <HeroSection
          title="Home Learning Activities"
          subtitle="Fun, no-device activities to do with your child"
        />

        <section className="space-y-4">
          {featuredLoading ? (
            <FeaturedActivitySkeletonCarousel count={3} />
          ) : featuredActivities && featuredActivities.length > 0 ? (
            <FeaturedActivitiesCarousel
              activities={featuredActivities}
              onSelect={handleNavigate}
              completedIds={completedIds}
            />
          ) : null}
        </section>

        <HomeActivitiesFilter
          filters={filters}
          categories={categories}
          onFiltersChange={setFilters}
        />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <TabsList className="bg-card shadow-sm border border-border/60">
                <TabsTrigger value="all">All Activities</TabsTrigger>
                <TabsTrigger value="completed">My Completed</TabsTrigger>
                <TabsTrigger value="duration">By Duration</TabsTrigger>
              </TabsList>
            </Tabs>

            {isFetching && !isLoading ? (
              <span className="text-xs font-semibold text-muted-foreground">
                Updating...
              </span>
            ) : null}
          </div>

          {isError ? (
            <ErrorMessage
              message="We couldn't load activities right now."
              onRetry={() => refetch()}
            />
          ) : null}

          {activeTab === 'completed' ? (
            completedLoading ? (
              <ActivityCardSkeletonGrid count={6} columns={3} />
            ) : filteredCompleted.length === 0 ? (
              <EmptyState
                title="You haven't completed any activities yet"
                description="Start exploring and mark activities when you finish them together."
              />
            ) : (
              renderActivitiesGrid(filteredCompleted)
            )
          ) : activeTab === 'duration' ? (
            isLoading ? (
              <ActivityCardSkeletonGrid count={6} columns={3} />
            ) : filteredActivities.length === 0 ? (
              <EmptyState
                title="No activities found"
                description="Try adjusting your filters to see more activities."
              />
            ) : (
              <div className="space-y-8">
                {durationSections.map((section) =>
                  section.items.length > 0 ? (
                    <div key={section.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">
                          {section.label}
                        </h3>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {section.items.length} activities
                        </span>
                      </div>
                      {renderActivitiesGrid(section.items)}
                    </div>
                  ) : null
                )}
              </div>
            )
          ) : isLoading ? (
            <ActivityCardSkeletonGrid count={6} columns={3} />
          ) : filteredActivities.length === 0 ? (
            <EmptyState
              title="No activities found"
              description="Try adjusting your filters!"
            />
          ) : (
            renderActivitiesGrid(filteredActivities)
          )}
        </section>

        {showPagination ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm font-semibold text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
