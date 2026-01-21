import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/classes/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/classes/create"!</div>
}
