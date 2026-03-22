import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  useAdminUsers, 
  useSuspendUser, 
  useDeleteUser 
} from '../api/useAdminUsers';
import { Search, ShieldAlert, Trash2 } from 'lucide-react';
// Giả định thư viện UI của dự án:
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export function AdminUserListPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '', status: 'all' });
  const { data, isLoading } = useAdminUsers(filters);
  const suspendUser = useSuspendUser();
  const deleteUser = useDeleteUser();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleSuspend = async (userId: string) => {
    if (confirm('Are you sure you want to suspend this user globally?')) {
      await suspendUser.mutateAsync({ userId, data: { scope: 'global', reason: 'Admin action' } });
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      await deleteUser.mutateAsync(userId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
        <div className="flex gap-2">
          {/* <Button variant="outline">Export CSV</Button> */}
          {/* <Button>Invite User</Button> */}
          <button className="px-4 py-2 border rounded shadow-sm hover:bg-gray-50">Export CSV</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700">Invite User</button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            className="w-full pl-9 pr-4 py-2 border rounded-md" 
            placeholder="Search by email, name..." 
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
        <select 
          className="border rounded-md px-3 py-2"
          value={filters.status} 
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-500">User</th>
              <th className="px-6 py-3 font-medium text-gray-500">Tenants</th>
              <th className="px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 font-medium text-gray-500">Last Login</th>
              <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
            ) : data?.data.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
            ) : (
              data?.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-gray-500 text-xs">{user.email} • {user.authProvider}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{user.tenantCount} orgs</div>
                    {user.primaryTenant && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        ▸ {user.primaryTenant.name} ({user.primaryTenant.role})
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        to="/admin/users/$userId"
                        params={{ userId: user.id }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        View
                      </Link>
                      <button 
                        onClick={() => handleSuspend(user.id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded" 
                        title="Suspend"
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-sm text-gray-500">
          <div>Showing page {data?.meta?.page || 1} of {data?.meta?.totalPages || 1}</div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={filters.page === 1}
              onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
            >
              Previous
            </button>
            <button 
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={!data?.meta || data.meta.page >= data.meta.totalPages}
              onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
