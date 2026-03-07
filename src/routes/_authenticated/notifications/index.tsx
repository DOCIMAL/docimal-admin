import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: () => <div>Hello "/_authenticated/notifications/"!</div>,
})
