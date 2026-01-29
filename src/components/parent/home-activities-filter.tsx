'use client'

import { useMemo, useState } from 'react'
import { Filter, SlidersHorizontal, X } from 'lucide-react'

import type { CategoryDetail } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface FilterState {
  ageGroup: string
  difficulty: string
  category: number | null
}

const ageGroupOptions = [
  { value: '', label: 'All Ages' },
  { value: 'pre_primary', label: 'Pre-Primary' },
  { value: 'standard_1', label: 'Standard 1' },
  { value: 'standard_2', label: 'Standard 2' },
]

const difficultyOptions = [
  { value: '', label: 'All', classes: 'bg-muted/60 text-muted-foreground' },
  { value: 'easy', label: 'Easy', classes: 'bg-green-100 text-green-800 border border-green-300' },
  { value: 'medium', label: 'Medium', classes: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  { value: 'hard', label: 'Hard', classes: 'bg-red-100 text-red-800 border border-red-300' },
]

export interface HomeActivitiesFilterProps {
  filters: FilterState
  categories?: Array<CategoryDetail>
  onFiltersChange: (value: FilterState) => void
  className?: string
}

export function HomeActivitiesFilter({
  filters,
  categories = [],
  onFiltersChange,
  className,
}: HomeActivitiesFilterProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const safeCategories = categories.filter(
    (category): category is CategoryDetail => Boolean(category)
  )
  const gridTemplate =
    safeCategories.length > 0
      ? 'md:grid-cols-[1.4fr_1fr_220px]'
      : 'md:grid-cols-[1.4fr_1fr]'

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.ageGroup) count += 1
    if (filters.difficulty) count += 1
    if (filters.category) count += 1
    return count
  }, [filters.ageGroup, filters.category, filters.difficulty])

  const handleClearFilters = () => {
    onFiltersChange({ ageGroup: '', difficulty: '', category: null })
  }

  const handleAgeGroupChange = (value: string) => {
    onFiltersChange({
      ...filters,
      ageGroup: filters.ageGroup === value ? '' : value,
    })
  }

  const handleDifficultyChange = (value: string) => {
    if (!value) {
      onFiltersChange({ ...filters, difficulty: '' })
      return
    }
    onFiltersChange({
      ...filters,
      difficulty: filters.difficulty === value ? '' : value,
    })
  }

  return (
    <div className={cn('sticky top-20 z-20', className)}>
      <div className="rounded-2xl border border-border/60 bg-card/95 p-4 shadow-lg backdrop-blur md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {activeFilterCount}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 gap-2 rounded-xl text-muted-foreground hover:text-destructive"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Filters</span>
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                className="h-9 gap-2 rounded-xl md:hidden"
                onClick={() => setShowMobileFilters((prev) => !prev)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showMobileFilters ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'grid gap-4 overflow-hidden md:overflow-visible',
              gridTemplate,
              'transition-all duration-300',
              showMobileFilters
                ? 'max-h-105 opacity-100'
                : 'max-h-0 opacity-0 md:max-h-none md:opacity-100'
            )}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Age Group
              </span>
              <div className="flex flex-wrap gap-2">
                {ageGroupOptions.map((option) => {
                  const isActive = filters.ageGroup === option.value || (!filters.ageGroup && option.value === '')
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleAgeGroupChange(option.value)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Difficulty
              </span>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((option) => {
                  const isActive = filters.difficulty === option.value || (!filters.difficulty && option.value === '')
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => handleDifficultyChange(option.value)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                        isActive
                          ? option.value
                            ? option.classes
                            : 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {safeCategories.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Category
                </span>
                <Select
                  value={filters.category ? String(filters.category) : 'all'}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      category: value === 'all' ? null : Number(value),
                    })
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-2 bg-transparent">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent align="start" className="rounded-xl">
                    <SelectItem value="all">All categories</SelectItem>
                    {safeCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-flex h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: category.color || 'var(--color-kids-blue)' }}
                          />
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
