import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/parent/home-activities')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/parent/home-activities"!</div>
}
