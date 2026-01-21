import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/parent/guides')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/parent/guides"!</div>
}
