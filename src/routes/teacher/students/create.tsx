import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/students/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/students/create"!</div>
}
