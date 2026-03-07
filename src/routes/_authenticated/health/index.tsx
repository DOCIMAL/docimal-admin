import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/health/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/health/"!</div>
}
