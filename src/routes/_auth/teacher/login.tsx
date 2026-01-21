import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/teacher/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/teacher/login"!</div>
}
