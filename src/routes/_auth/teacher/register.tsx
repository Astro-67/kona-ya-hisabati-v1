import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/teacher/register')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/teacher/register"!</div>
}
