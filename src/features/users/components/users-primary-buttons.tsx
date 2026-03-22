import { useState } from 'react'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { type User } from '../data/schema'
import { useUsers } from './users-provider'

export function UsersPrimaryButtons() {
  const [isExporting, setIsExporting] = useState(false)
  const { tableRef, selectedTenants } = useUsers()

  const handleExportCsv = () => {
    try {
      setIsExporting(true)
      const table = tableRef.current
      if (!table) {
        toast.error('Table is not ready')
        return
      }

      // Use selected rows if any are checked, otherwise use all filtered rows
      const selectedRows = table.getFilteredSelectedRowModel().rows
      const rows =
        selectedRows.length > 0
          ? selectedRows
          : table.getFilteredRowModel().rows

      if (rows.length === 0) {
        toast.error('No data to export')
        return
      }

      const headers = [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Tenant',
        'Role',
        'Status',
        'Auth Provider',
        'Joined Date',
        'Last Login',
      ]
      const csvRows = rows.map((row) => {
        const u = row.original as User
        // Determine which tenant/role to show based on current UI selection
        const selectedTenantId = selectedTenants[u.id]
        const membership =
          u.tenantMemberships?.find((m) => m.tenant.id === selectedTenantId) ||
          u.tenantMemberships?.find(
            (m) => m.tenant.id === u.primaryTenant?.id
          ) ||
          (u.tenantMemberships?.length ? u.tenantMemberships[0] : null)

        const tenantName =
          membership?.tenant?.name ?? u.primaryTenant?.name ?? ''
        const role = membership?.role ?? u.primaryTenant?.role ?? ''

        return [
          u.id,
          `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
          u.email,
          (u as User & { phone?: string }).phone || '',
          tenantName,
          role.replace('tenant_', '').replace(/_/g, ' '),
          u.status,
          u.authProvider ?? '',
          u.createdAt ? format(new Date(u.createdAt), 'yyyy-MM-dd') : '',
          u.lastLoginAt ? format(new Date(u.lastLoginAt), 'yyyy-MM-dd') : '',
        ]
      })

      const csvContent = [
        headers.join(','),
        ...csvRows.map((r) =>
          r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `users_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      const label =
        selectedRows.length > 0
          ? `Exported ${rows.length} selected users`
          : `Exported ${rows.length} users`
      toast.success(label)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', error)
      toast.error('Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={handleExportCsv}
        disabled={isExporting}
      >
        <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        <Download size={18} />
      </Button>
    </div>
  )
}
