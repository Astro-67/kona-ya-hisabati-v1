import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/parent/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/parent/register"!</div>
}
