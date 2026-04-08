import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ShieldAlert, ArrowRight, PauseCircle, PlayCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tenant } from '@/api/tenants.api'

// We will pass actions in through the meta object of the table so components remain server-independent
export const getColumns = (
  onSuspend: (tenant: Tenant) => void,
  onActivate: (tenant: Tenant) => void,
  onExtend: (tenant: Tenant) => void
): ColumnDef<Tenant>[] => [
  {
    accessorKey: 'name',
    header: 'Tenant Name',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => {
      const plan = row.getValue('plan') as string
      return (
        <Badge variant={plan === 'enterprise' ? 'default' : 'secondary'} className='capitalize'>
          {plan}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      let variant: 'default' | 'destructive' | 'secondary' | 'outline' = 'outline'
      if (status === 'active') variant = 'default'
      if (status === 'suspended') variant = 'destructive'
      if (status === 'trial') variant = 'secondary'

      return (
        <Badge variant={variant} className='capitalize'>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'userCount',
    header: 'Members',
    cell: ({ row }) => {
      const count = row.getValue('userCount') as number
      return <div className="font-medium">{count}</div>
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string
      if (!dateStr) return '-'
      return <span>{format(new Date(dateStr), 'MMM dd, yyyy')}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const tenant = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <Link to="/tenants/$tenantId" params={{ tenantId: tenant.id }}>
              <DropdownMenuItem className="cursor-pointer">
                <ArrowRight className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator />

            {tenant.status === 'trial' && (
              <DropdownMenuItem onClick={() => onExtend(tenant)}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Extend Trial
              </DropdownMenuItem>
            )}

            {tenant.status === 'suspended' ? (
              <DropdownMenuItem onClick={() => onActivate(tenant)} className="text-green-600 focus:text-green-600">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onSuspend(tenant)} className="text-orange-600 focus:text-orange-600">
                <PauseCircle className="mr-2 h-4 w-4" />
                Suspend
              </DropdownMenuItem>
            )}

          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
