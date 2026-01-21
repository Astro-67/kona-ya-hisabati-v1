import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/teacher/lesson-plans/$lessonId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/teacher/lesson-plans/$lessonId"!</div>
}
