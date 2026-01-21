import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/lesson-plans/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/lesson-plans/create"!</div>
}
