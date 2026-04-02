import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminInvoice, InvoiceStatus } from '@/api/billing.api'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/data-table'

// Status badge colors
const statusColors: Record<InvoiceStatus, string> = {
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  open: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100', // Open
  uncollectible: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  void: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100', // Void
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const InvoiceDownloadButton = ({
  stripeInvoiceId,
}: {
  stripeInvoiceId: string
}) => {
  const handleDownload = async () => {
    try {
      const response = await apiClient.get(
        `/admin/billing/invoices/${stripeInvoiceId}/render`,
        {
          responseType: 'blob',
        }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Note: We don't revoke immediately so the new tab can load the blob.
    } catch (_error) {
      toast.error('Failed to open invoice PDF')
    }
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleDownload}
      className='h-8 w-8 p-0 text-muted-foreground transition-colors hover:text-primary'
      title='View PDF'
    >
      <Download className='h-4 w-4' />
    </Button>
  )
}

export const invoicesColumns: ColumnDef<AdminInvoice>[] = [
  {
    id: 'tenant',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tenant' />
    ),
    accessorFn: (row) => row.tenantName,
    cell: ({ row }) => {
      const { tenantName, tenantId } = row.original
      const displayName = tenantName || tenantId || 'Unknown Tenant'
      return (
        <a
          href={`/tenants/${tenantId}`}
          target='_blank'
          rel='noreferrer'
          className='group block flex max-w-[200px] items-center gap-1 truncate font-medium hover:text-primary'
          title={displayName}
        >
          {displayName}
          <ExternalLink className='mb-1 inline-block h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100' />
        </a>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-6 max-md:sticky start-0 @4xl/content:table-cell @4xl/content:drop-shadow-none',
        'w-[24%] min-w-[220px]'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'stripeInvoiceId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Invoice ID' />
    ),
    cell: ({ row }) => {
      const id = row.getValue('stripeInvoiceId') as string
      return (
        <div className='font-mono text-xs text-muted-foreground uppercase'>
          {id}
        </div>
      )
    },
    meta: {
      className: 'w-[18%] min-w-[170px] px-4',
    },
  },
  {
    accessorKey: 'amountPaid',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Amount'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const amountPaid = row.original.amountPaid
      return (
        <div className='text-center font-medium'>
          {formatCurrency(amountPaid)}
        </div>
      )
    },
    meta: {
      className: 'w-[10%] min-w-[110px] px-4',
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
      const status = row.getValue('status') as InvoiceStatus
      return (
        <div className='flex justify-center'>
          <Badge
            className={cn(
              'capitalize',
              statusColors[status] || statusColors.void
            )}
          >
            {status}
          </Badge>
        </div>
      )
    },
    meta: {
      className: 'w-[10%] min-w-[110px] px-4',
    },
    enableSorting: true,
  },
  {
    id: 'period',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Period'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const start = row.original.periodStart
      const end = row.original.periodEnd
      if (!start || !end) return <div className='text-center text-sm'>-</div>
      const startStr = formatDate(start)
      const endStr = formatDate(end)
      return (
        <div className='text-center text-sm'>
          {startStr} - {endStr}
        </div>
      )
    },
    meta: {
      className: 'w-[18%] min-w-[180px] px-4',
    },
    enableSorting: false,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Due Date'
        className='-mr-3 justify-end text-right'
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('dueDate') as string
      return <div className='text-right text-sm'>{formatDate(date)}</div>
    },
    meta: {
      className: 'w-[10%] min-w-[110px] px-4',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'paidAt',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Paid Date'
        className='-mr-3 justify-end text-right'
      />
    ),
    cell: ({ row }) => {
      const date = row.getValue('paidAt') as string
      return <div className='text-right text-sm'>{formatDate(date)}</div>
    },
    meta: {
      className: 'w-[10%] min-w-[110px] px-4',
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='PDF'
        className='justify-center text-center'
      />
    ),
    cell: ({ row }) => {
      const pdfUrl = row.original.invoicePdf

      if (!pdfUrl)
        return (
          <div className='flex h-8 items-center justify-center'>
            <span className='text-xs text-muted-foreground'>N/A</span>
          </div>
        )

      return (
        <div className='flex justify-center'>
          <InvoiceDownloadButton
            stripeInvoiceId={row.original.stripeInvoiceId}
          />
        </div>
      )
    },
    meta: {
      className: 'w-[8%] min-w-[76px] px-3',
    },
    enableSorting: false,
    enableHiding: false,
  },
]
