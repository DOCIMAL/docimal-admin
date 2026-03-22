import { createFileRoute } from '@tanstack/react-router';
import { AdminUserListPage } from '@/features/users/components/AdminUserListPage';

export const Route = createFileRoute('/_authenticated/admin/users/')({
  component: AdminUsersRouteComponent,
});

function AdminUsersRouteComponent() {
  return <AdminUserListPage />;
}
