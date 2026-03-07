import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tenants/')({
  component: () => <div>Hello "/_authenticated/tenants/"!</div>,
})
