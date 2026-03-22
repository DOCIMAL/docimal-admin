import { createFileRoute } from '@tanstack/react-router'
import { AdminUserDetailPage } from '@/features/users/components/AdminUserDetailPage'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserDetailRouteComponent,
})

function AdminUserDetailRouteComponent() {
  const { userId } = Route.useParams()
  return <AdminUserDetailPage userId={userId} />
}
