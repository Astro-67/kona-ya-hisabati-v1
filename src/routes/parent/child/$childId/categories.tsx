import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/parent/child/$childId/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/parent/child/$childId/categories"!</div>
}
