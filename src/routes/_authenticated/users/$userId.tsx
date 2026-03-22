import { createFileRoute } from '@tanstack/react-router'
import { AdminUserDetailPage } from '@/features/users/components/AdminUserDetailPage'

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailRoute,
})

function UserDetailRoute() {
  const { userId } = Route.useParams()
  return <AdminUserDetailPage userId={userId} />
}
