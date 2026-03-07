import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/integrations/')({
  component: () => <div>Hello "/_authenticated/integrations/"!</div>,
})
