import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/lesson-plans/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/lesson-plans/"!</div>
}
