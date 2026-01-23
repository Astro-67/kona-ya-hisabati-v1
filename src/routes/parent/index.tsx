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



  const { data: children, isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      // Use correct parent children endpoint
      const response = await apiClient.get('/parent/children/');
      const results = Array.isArray(response.data) ? response.data : response.data?.results ?? [];
      return results.map((s: any) => {
        const id = String(s.child_id);
        return {
          id,
          name: s.child_name || s.username || `Student ${id}`,
          grade: null, // No grade in this API
          progress: Math.max(0, Math.min(100, Number(s.total_points ?? 0))),
        };
      });
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
              onClick={() => {
                if (child.id && child.id !== 'undefined') {
                  navigate({
                    to: `/parent/child/${child.id}/categories`,
                    params: { childId: child.id.toString() },
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      <AddChildDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}
