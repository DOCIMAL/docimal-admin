import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/billing/invoices')({
  component: () => <div>Hello "/_authenticated/billing/invoices"!</div>,
})
