import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/billing/subscriptions')({
  component: () => <div>Hello "/_authenticated/billing/subscriptions"!</div>,
})
