import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/resources/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/resources/"!</div>
}
