import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/classes/$classId/students')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/classes/$classId/students"!</div>
}
