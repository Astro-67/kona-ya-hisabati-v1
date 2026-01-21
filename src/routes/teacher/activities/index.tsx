import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/activities/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/activities/"!</div>
}
