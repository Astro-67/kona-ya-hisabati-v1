'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'

import type { HomeActivity } from '@/types'
import { HomeActivityCard } from '@/components/parent/home-activity-card'
import { cn } from '@/lib/utils'

export interface FeaturedActivitiesCarouselProps {
  activities: Array<HomeActivity>
  onSelect: (activityId: number) => void
  completedIds?: Set<number>
  autoScroll?: boolean
  className?: string
}

export function FeaturedActivitiesCarousel({
  activities,
  onSelect,
  completedIds,
  autoScroll = true,
  className,
}: FeaturedActivitiesCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const rafRef = useRef<number | null>(null)

  const itemCount = activities.length

  const hasMultiple = itemCount > 1

  const scrollToIndex = (index: number) => {
    const target = cardRefs.current[index]
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    }
    setActiveIndex(index)
  }

  useEffect(() => {
    if (!autoScroll || !hasMultiple) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % itemCount
        const target = cardRefs.current[next]
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
        }
        return next
      })
    }, 5000)

    return () => window.clearInterval(interval)
  }, [autoScroll, hasMultiple, itemCount])

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      const container = containerRef.current
      if (!container) return

      const containerLeft = container.getBoundingClientRect().left
      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY

      cardRefs.current.forEach((card, index) => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const distance = Math.abs(rect.left - containerLeft)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      setActiveIndex(closestIndex)
    })
  }, [containerRef, cardRefs, rafRef])

  useEffect(() => {
    if (itemCount > 0) {
      handleScroll()
    }
  }, [itemCount, handleScroll])

  const dots = useMemo(() => Array.from({ length: itemCount }), [itemCount])

  return (
    <section className={cn('space-y-4', className)} aria-label="Featured activities">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-secondary" />
        <h2 className="text-xl font-bold text-foreground">Featured Activities</h2>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
      >
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            ref={(el) => {
              cardRefs.current[index] = el
            }}
            data-featured-card
            className="min-w-full sm:min-w-[320px] sm:max-w-95 shrink-0 snap-start"
          >
            <HomeActivityCard
              activity={activity}
              variant="featured"
              isCompleted={
                (completedIds && completedIds.has(activity.id)) ||
                Boolean((activity as { completed?: boolean }).completed)
              }
              onClick={() => onSelect(activity.id)}
            />
          </div>
        ))}
      </div>

      {hasMultiple && (
        <div className="flex items-center gap-2">
          {dots.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to featured activity ${index + 1}`}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all',
                index === activeIndex
                  ? 'bg-primary shadow-md scale-110'
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'
              )}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
