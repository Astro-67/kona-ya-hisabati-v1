import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/parent/child/$childId/activity/$activityId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/parent/child/$childId/activity/$activityId"!</div>
}
