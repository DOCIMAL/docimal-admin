import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/documents/')({
  component: () => <div>Hello "/_authenticated/documents/"!</div>,
})
