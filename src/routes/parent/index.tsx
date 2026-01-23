import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ChildProfileCard } from '@/components/parent/child-profile-card'
import { AddChildDialog } from '@/components/parent/add-child-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const Route = createFileRoute('/parent/')({
  component: ParentDashboard,
})

function ParentDashboard() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const navigate = useNavigate()

  function formatGrade(raw?: string | null) {
    if (!raw) return null
    // turn 'pre_primary_1' -> 'Pre Primary 1'
    return raw
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  }

  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      // Backend provides students at /users/students/ — use results array
      const response = await apiClient.get('/users/students/')
      const results = response.data?.results ?? []

      return results.map((s: any) => ({
        id: s.id,
        name: `${s.user?.first_name ?? ''} ${s.user?.last_name ?? ''}`.trim() || s.user?.username || `Student ${s.id}`,
        grade: formatGrade(s.grade_level),
        // Use total_points as a simple progress indicator (clamped to 0-100)
        progress: Math.max(0, Math.min(100, Number(s.total_points ?? 0))),
      }))
    },
  })

  if (isLoading) return (
    <div className="container mx-auto px-4 py-8">
      <LoadingSpinner />
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Children</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>

      {Array.isArray(children) && children.length === 0 ? (
        <EmptyState
          title="No children yet"
          description="Add your child to get started with activities and tracking."
          actionLabel="Add Your First Child"
          onAction={() => setShowAddDialog(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children?.map((child: any) => (
            <ChildProfileCard
              key={child.id}
              child={child}
              onClick={() => navigate({ to: `/parent/child/${child.id}/categories` })}
            />
          ))}
        </div>
      )}

      <AddChildDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}
