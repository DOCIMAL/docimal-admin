import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/tenants/$tenantId')({
  component: () => <div>Tenant Detail Page Placeholder</div>,
})
