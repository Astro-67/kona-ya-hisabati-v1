import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/parent/child/$childId/category/$categorySlug',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/parent/child/$childId/category/$categorySlug"!</div>
}
