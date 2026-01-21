import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/assignments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/assignments/"!</div>
}
