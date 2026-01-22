import { Outlet, createFileRoute } from '@tanstack/react-router'
import { ParentHeader } from '@/components/parent/parent-header'
import { ParentFooter } from '@/components/parent/parent-footer'
import { requireParent } from '@/lib/route-guards'

export const Route = createFileRoute('/parent')({
  beforeLoad: () => {
    requireParent()
  },
  component: ParentLayout,
})

function ParentLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ParentHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <ParentFooter />
    </div>
  )
}
