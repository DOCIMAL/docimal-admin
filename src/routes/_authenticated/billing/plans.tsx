import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/billing/plans')({
  component: () => <div>Hello "/_authenticated/billing/plans"!</div>,
})
