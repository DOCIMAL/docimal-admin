import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/data-table'
import { callTypes } from '../data/data'
import { type User } from '../data/schema'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableRowActions } from './data-table-row-actions'
import { RoleLabel } from './role-label'

function formatDate(date?: Date | null): string {
  if (!date) return 'Never'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffH / 24)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 30) return `${diffD}d ago`
  return d.toLocaleDateString()
}

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    accessorFn: (row) => row.firstName + ' ' + row.lastName,
    cell: ({ row }) => {
      const { firstName, lastName, email, avatar } = row.original
      const initials =
        `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() ||
        email[0].toUpperCase()
      return (
        <div className='flex items-center gap-3 ps-0.5'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={avatar ?? undefined} alt={initials} />
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium leading-none'>
              {firstName} {lastName}
            </div>
            <div className='text-xs text-muted-foreground mt-0.5'>{email}</div>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>{row.getValue('email')}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'phone',
    header: 'Phone Number',
    cell: ({ row }) => (
      <span className='text-sm text-muted-foreground'>
        {row.original.phone ?? '—'}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: 'tenants',
    header: 'Tenants',
    cell: ({ row, table }) => {
      const { tenantCount, primaryTenant, tenantMemberships, id } = row.original
      const meta = table.options.meta as any
      const selectedTenantId = meta?.selectedTenants?.[id] || primaryTenant?.id

      const effectiveMemberships =
        tenantMemberships && tenantMemberships.length > 0
          ? tenantMemberships
          : primaryTenant
            ? [{ tenant: primaryTenant, role: primaryTenant.role }]
            : []

      if (effectiveMemberships.length === 0) {
        return <span className='text-sm text-muted-foreground'>0 orgs</span>
      }

      const selectedMembership =
        effectiveMemberships.find((m) => m.tenant.id === selectedTenantId) ||
        effectiveMemberships.find((m) => m.tenant.id === primaryTenant?.id) ||
        effectiveMemberships[0]

      return (
        <div className='flex flex-col'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                'flex items-center gap-1.5 font-medium transition-colors outline-none text-sm w-fit group',
                effectiveMemberships.length > 0 ? 'hover:text-primary cursor-pointer' : 'cursor-default'
              )}>
                <span className='group-hover:underline underline-offset-4'>
                  {tenantCount} org{tenantCount !== 1 ? 's' : ''}
                </span>
                <ChevronDown className='h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-56 overflow-y-auto max-h-72'>
              {effectiveMemberships.map((m, idx) => (
                <DropdownMenuItem
                  key={`${m.tenant.id}-${idx}`}
                  onClick={() => meta?.setSelectedTenant(id, m.tenant.id)}
                  className={cn(
                    'flex flex-col items-start gap-1 py-2 cursor-pointer',
                    m.tenant.id === selectedTenantId ? 'bg-muted' : ''
                  )}
                >
                  <span className='font-medium'>{m.tenant.name}</span>
                  <span className='text-xs text-muted-foreground capitalize'>
                    {m.role.replace('tenant_', '').replace(/_/g, ' ')}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className='text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5 px-0.5 max-w-[180px]'>
             <span className='opacity-50 font-mono'>▸</span> 
             <span className='truncate font-medium text-foreground/70'>{selectedMembership.tenant.name}</span>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' className='justify-center text-center' />
    ),
    cell: ({ row }) => {
      const { status } = row.original
      const badgeColor = callTypes.get(status)
      return (
        <div className='flex justify-center'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'role',
    header: () => <div className='text-center'>Role</div>,
    accessorFn: (row) => row.primaryTenant?.role ?? row.role ?? 'user',
    cell: ({ row, table }) => {
      const { tenantMemberships, primaryTenant, role, id } = row.original
      const selectedTenantId = (table.options.meta as any)?.selectedTenants?.[id]
      
      let displayRole = primaryTenant?.role ?? role ?? ''
      if (selectedTenantId && tenantMemberships) {
        const m = tenantMemberships.find((m) => m.tenant.id === selectedTenantId)
        if (m) displayRole = m.role
      }
      return (
        <div className='flex justify-center'>
          <RoleLabel role={displayRole} />
        </div>
      )
    },
    enableSorting: false,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'authProvider',
    header: () => <div className='text-center'>Auth Provider</div>,
    cell: ({ row }) => (
      <div className='text-center'>
        <span className='capitalize text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium'>
          {row.original.authProvider}
        </span>
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableHiding: true,
    enableSorting: false,
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Login' className='justify-center text-center' />
    ),
    cell: ({ row }) => (
      <div className='text-center text-sm text-muted-foreground'>
        {formatDate(row.original.lastLoginAt)}
      </div>
    ),
    enableHiding: true,
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>Actions</div>,
    cell: (props) => (
      <div className='flex justify-center'>
        <DataTableRowActions {...props} />
      </div>
    ),
  },
]
