import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/billing/invoices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/billing/invoices"!</div>
}
