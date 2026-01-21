import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/assignments/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/assignments/create"!</div>
}
