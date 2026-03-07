import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/audit-logs/')({
  component: () => <div>Hello "/_authenticated/audit-logs/"!</div>,
})
