'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  Filter,
  Home,
  Layers,
  Search,
  SlidersHorizontal,
  Video,
  X,
} from 'lucide-react'

import type { ParentGuideAgeGroup, ParentGuideType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const resourceTabs = [
  { label: 'All', value: '', icon: Layers },
  { label: 'Guides', value: 'text_guide', icon: BookOpen, color: 'kids-blue' },
  { label: 'Videos', value: 'video_tutorial', icon: Video, color: 'kids-orange' },
  { label: 'Activities', value: 'offline_activity', icon: Home, color: 'kids-green' },
]

const guideTypeOptions: Array<{ value: ParentGuideType; label: string; color: string }> = [
  { value: 'learning_tips', label: 'Learning Tips', color: 'bg-kids-blue' },
  { value: 'activity_ideas', label: 'Activities', color: 'bg-kids-green' },
  { value: 'progress_help', label: 'Progress', color: 'bg-kids-orange' },
  { value: 'motivation', label: 'Motivation', color: 'bg-kids-pink' },
  { value: 'development', label: 'Development', color: 'bg-kids-yellow' },
  { value: 'homework_help', label: 'Homework', color: 'bg-purple-500' },
]

const ageGroupOptions: Array<{ value: ParentGuideAgeGroup | ''; label: string; shortLabel: string }> = [
  { value: '', label: 'All Ages', shortLabel: 'All' },
  { value: 'pre_primary', label: 'Pre-Primary (3-5)', shortLabel: '3-5' },
  { value: 'standard_1', label: 'Standard 1 (6-7)', shortLabel: '6-7' },
  { value: 'standard_2', label: 'Standard 2 (7-8)', shortLabel: '7-8' },
]

export interface GuidesFiltersProps {
  resourceType: string
  ageGroup: string
  guideTypes: Array<string>
  searchQuery: string
  onResourceTypeChange: (value: string) => void
  onAgeGroupChange: (value: string) => void
  onGuideTypesChange: (value: Array<string>) => void
  onSearchQueryChange: (value: string) => void
  onClearFilters: () => void
}

export function GuidesFilters({
  resourceType,
  ageGroup,
  guideTypes,
  searchQuery,
  onResourceTypeChange,
  onAgeGroupChange,
  onGuideTypesChange,
  onSearchQueryChange,
  onClearFilters,
}: GuidesFiltersProps) {
  const [draftSearch, setDraftSearch] = useState(searchQuery)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    setDraftSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchQueryChange(draftSearch.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [draftSearch, onSearchQueryChange])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (resourceType) count += 1
    if (ageGroup) count += 1
    count += guideTypes.length
    if (searchQuery) count += 1
    return count
  }, [resourceType, ageGroup, guideTypes.length, searchQuery])

  const toggleGuideType = (value: string) => {
    if (guideTypes.includes(value)) {
      onGuideTypesChange(guideTypes.filter((type) => type !== value))
    } else {
      onGuideTypesChange([...guideTypes, value])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-lg border border-border/50 lg:flex-row lg:items-center lg:p-5">
        <div className="flex-1">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 -mx-1 px-1 scrollbar-hide">
            {resourceTabs.map((tab) => {
              const isActive = resourceType === tab.value
              const Icon = tab.icon
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => onResourceTypeChange(tab.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap',
                    'transition-all duration-200 flex-shrink-0',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Search guides..."
              aria-label="Search guides"
              className="h-11 pl-10 pr-10 rounded-xl border-2 border-border bg-background focus:border-primary"
            />
            {draftSearch && (
              <button
                type="button"
                onClick={() => setDraftSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-11 gap-2 rounded-xl border-2 bg-transparent whitespace-nowrap',
                  ageGroup ? 'border-primary bg-primary/5' : ''
                )}
              >
                <span className="hidden sm:inline">
                  {ageGroupOptions.find((o) => o.value === ageGroup || (o.value === '' && !ageGroup))?.label || 'Age'}
                </span>
                <span className="sm:hidden">
                  {ageGroupOptions.find((o) => o.value === ageGroup || (o.value === '' && !ageGroup))?.shortLabel || 'Age'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 rounded-xl" align="end">
              <div className="space-y-1">
                {ageGroupOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onAgeGroupChange(option.value)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      ageGroup === option.value || (!ageGroup && option.value === '')
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="button"
            variant={showAdvanced ? 'default' : 'outline'}
            className={cn(
              'h-11 gap-2 rounded-xl border-2 bg-transparent',
              showAdvanced ? 'bg-primary border-primary' : ''
            )}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">More</span>
            {activeFilterCount > 0 && (
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                  showAdvanced ? 'bg-white text-primary' : 'bg-primary text-white'
                )}
              >
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="h-11 gap-2 text-muted-foreground hover:text-destructive rounded-xl"
              onClick={onClearFilters}
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="rounded-2xl bg-card p-5 shadow-lg border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-foreground">Filter by Topic</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {guideTypeOptions.map((option) => {
              const isActive = guideTypes.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleGuideType(option.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold',
                    'transition-all duration-200',
                    isActive
                      ? `${option.color} text-white shadow-md`
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {option.label}
                  {isActive && <X className="h-3.5 w-3.5" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {(guideTypes.length > 0 || ageGroup) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Active:</span>

          {ageGroup && (
            <Badge
              className="gap-2 rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 cursor-pointer hover:bg-primary/20"
              onClick={() => onAgeGroupChange('')}
            >
              {ageGroupOptions.find((o) => o.value === ageGroup)?.label}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {guideTypes.map((type) => {
            const option = guideTypeOptions.find((o) => o.value === type)
            return (
              <Badge
                key={type}
                className={cn(
                  'gap-2 rounded-full px-3 py-1.5 cursor-pointer border-0 text-white',
                  option?.color || 'bg-primary'
                )}
                onClick={() => toggleGuideType(type)}
              >
                {option?.label ?? type}
                <X className="h-3 w-3" />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
