import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/students/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/students/"!</div>
}
