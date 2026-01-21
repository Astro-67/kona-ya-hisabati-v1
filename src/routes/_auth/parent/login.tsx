import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/parent/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/parent/login"!</div>
}
