import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import type {
  AdminSubscription,
  SubscriptionStatus,
  SubscriptionPlan,
} from '@/api/billing.api'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { ActionsCell } from './subscriptions-actions'

// Plan badge colors
const planColors: Record<SubscriptionPlan, string> = {
  free: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
  starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  professional:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  enterprise:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
}

// Status badge colors
const statusColors: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  trialing: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  past_due:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const subscriptionsColumns: ColumnDef<AdminSubscription>[] = [
  {
    id: 'tenant',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tenant' />
    ),
    accessorFn: (row) => row.tenantName,
    cell: ({ row }) => {
      const { tenantName, tenantSlug, tenantId } = row.original

      return (
        <div className='flex items-center gap-2'>
          <a
            href={`/tenants/${tenantId}`}
            target='_blank'
            rel='noreferrer'
            className='group flex items-center gap-1 font-medium hover:text-primary'
          >
            {tenantName}
            <ExternalLink className='h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100' />
          </a>
          <span className='text-xs text-muted-foreground'>({tenantSlug})</span>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-6 max-md:sticky start-0 @4xl/content:table-cell @4xl/content:drop-shadow-none',
        'w-[24%] min-w-[240px]'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'plan',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Plan'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const plan = row.getValue('plan') as SubscriptionPlan
      return (
        <div className='flex justify-center'>
          <Badge
            className={cn(
              'capitalize',
              planColors[plan] || 'bg-slate-100 text-slate-800'
            )}
          >
            {plan || '—'}
          </Badge>
        </div>
      )
    },
    meta: {
      className: 'w-[12%] min-w-[120px] px-4',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Status'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as SubscriptionStatus
      return (
        <div className='flex justify-center'>
          <Badge className={cn('capitalize', statusColors[status])}>
            {status === 'past_due' ? 'Past Due' : status}
          </Badge>
        </div>
      )
    },
    meta: {
      className: 'w-[12%] min-w-[120px] px-4',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Amount'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number
      const currency = row.original.currency
      return (
        <div className='text-center font-medium'>
          {formatCurrency(amount, currency)} / mo
        </div>
      )
    },
    meta: {
      className: 'w-[14%] min-w-[120px] px-4',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'currentPeriodEnd',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Renews'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('currentPeriodEnd') as string
      return <div className='text-center text-sm'>{formatDate(date)}</div>
    },
    meta: {
      className: 'w-[14%] min-w-[130px] px-4',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Since'
        className='justify-end text-right'
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      return <div className='text-right text-sm'>{formatDate(date)}</div>
    },
    meta: {
      className: 'w-[14%] min-w-[130px] px-4',
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>Actions</div>,
    cell: ({ row }) => <ActionsCell row={row} />,
    meta: {
      className: 'w-[10%] min-w-[96px] px-3',
    },
    enableSorting: false,
    enableHiding: false,
  },
]
