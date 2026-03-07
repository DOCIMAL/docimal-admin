import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/billing/plans')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/billing/plans"!</div>
}
