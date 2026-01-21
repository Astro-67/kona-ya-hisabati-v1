import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/parent/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/parent/"!</div>
}
