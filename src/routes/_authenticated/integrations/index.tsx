import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/integrations/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/integrations/"!</div>
}
