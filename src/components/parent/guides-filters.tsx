import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

import type { ParentGuideAgeGroup, ParentGuideType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const resourceTabs = [
  { label: 'All', value: '' },
  { label: 'Guides', value: 'text_guide' },
  { label: 'Videos', value: 'video_tutorial' },
  { label: 'Activities', value: 'offline_activity' },
]

const guideTypeOptions: Array<{ value: ParentGuideType; label: string }> = [
  { value: 'learning_tips', label: 'Learning Tips' },
  { value: 'activity_ideas', label: 'Activity Ideas' },
  { value: 'progress_help', label: 'Progress Help' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'development', label: 'Development' },
  { value: 'homework_help', label: 'Homework Help' },
]

const ageGroupOptions: Array<{ value: ParentGuideAgeGroup | ''; label: string }> =
  [
    { value: '', label: 'All Ages' },
    { value: 'pre_primary', label: 'Pre-Primary' },
    { value: 'standard_1', label: 'Standard 1' },
    { value: 'standard_2', label: 'Standard 2' },
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
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    setDraftSearch(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchQueryChange(draftSearch.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [draftSearch, onSearchQueryChange])

  useEffect(() => {
    const guideTypeLabels = guideTypeOptions
      .filter((option) => guideTypes.includes(option.value))
      .map((option) => option.label)
      .join(', ')
    const ageLabel =
      ageGroupOptions.find((option) => option.value === ageGroup)?.label ?? 'All Ages'
    const resourceLabel =
      resourceTabs.find((option) => option.value === resourceType)?.label ?? 'All'
    setAnnouncement(
      `Filters updated. ${resourceLabel} resources, ${ageLabel}, guide types: ${guideTypeLabels || 'Any'}.`
    )
  }, [resourceType, ageGroup, guideTypes])

  const hasFilters = useMemo(
    () =>
      Boolean(resourceType) ||
      Boolean(ageGroup) ||
      guideTypes.length > 0 ||
      Boolean(searchQuery),
    [resourceType, ageGroup, guideTypes.length, searchQuery]
  )

  const toggleGuideType = (value: string) => {
    if (guideTypes.includes(value)) {
      onGuideTypesChange(guideTypes.filter((type) => type !== value))
      return
    }
    onGuideTypesChange([...guideTypes, value])
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={resourceType} onValueChange={onResourceTypeChange}>
              <TabsList aria-label="Filter by resource type">
                {resourceTabs.map((tab) => (
                  <TabsTrigger key={tab.label} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Select value={ageGroup} onValueChange={onAgeGroupChange}>
              <SelectTrigger
                className="min-h-11 min-w-45"
                aria-label="Filter by age group"
              >
                <SelectValue placeholder="Age group" />
              </SelectTrigger>
              <SelectContent>
                {ageGroupOptions
                  .filter((option) => option.value !== '')
                  .map((option) => (
                    <SelectItem key={option.label} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
            {guideTypeOptions.map((option) => {
              const active = guideTypes.includes(option.value)
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={active ? 'secondary' : 'outline'}
                  className="min-h-11 rounded-full px-4 text-xs font-semibold"
                  aria-pressed={active}
                  onClick={() => toggleGuideType(option.value)}
                >
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder="Search guides..."
              aria-label="Search guides"
              className="min-h-11 pl-9"
            />
          </div>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 gap-2 text-muted-foreground hover:text-foreground"
              onClick={onClearFilters}
              aria-label="Clear all filters"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {announcement}
      </div>

      {guideTypes.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {guideTypes.map((type) => (
            <Badge
              key={type}
              className="gap-2 rounded-full bg-primary/10 text-primary"
            >
              {guideTypeOptions.find((option) => option.value === type)?.label ?? type}
              <button
                type="button"
                aria-label={`Remove ${type} filter`}
                className="rounded-full p-0.5 hover:bg-primary/20"
                onClick={() => toggleGuideType(type)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
