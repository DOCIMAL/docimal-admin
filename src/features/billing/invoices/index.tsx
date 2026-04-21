import { getRouteApi } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminInvoice } from '@/api/billing.api'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { InvoicesProvider, useInvoices } from './components/invoices-provider'
import { InvoicesStats } from './components/invoices-stats'
import { InvoicesTable } from './components/invoices-table'

const route = getRouteApi('/_authenticated/billing/invoices')

type InvoicesContentProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

function InvoicesContent({ search, navigate }: InvoicesContentProps) {
  const { tableRef } = useInvoices()

  const handleExportCSV = () => {
    if (!tableRef.current) return

    const rows = tableRef.current.getFilteredRowModel().rows

    if (rows.length === 0) {
      toast.error('No data available to export')
      return
    }

    const headers = [
      'Tenant',
      'Invoice ID',
      'Stripe Invoice ID',
      'Amount Paid',
      'Status',
      'Period Start',
      'Period End',
      'Due Date',
      'Paid At',
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => {
        const inv = row.original as AdminInvoice
        const amountPaid = inv.amountPaid

        return [
          `"${inv.tenantName}"`,
          inv.id,
          inv.stripeInvoiceId,
          amountPaid,
          inv.status,
          inv.periodStart || '',
          inv.periodEnd || '',
          inv.dueDate || '',
          inv.paidAt || '',
        ].join(',')
      }),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `invoices_export_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV file downloaded successfully')
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col items-baseline justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Invoices</h2>
            <p className='text-muted-foreground'>
              Manage billing invoices and export records.
            </p>
          </div>
          <Button
            onClick={handleExportCSV}
            variant='outline'
            className='shrink-0'
          >
            <Download className='mr-2 h-4 w-4' />
            Export CSV
          </Button>
        </div>

        <InvoicesStats />

        <InvoicesTable search={search} navigate={navigate} />
      </Main>
    </>
  )
}

export function Invoices() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <InvoicesProvider>
      <InvoicesContent search={search} navigate={navigate as NavigateFn} />
    </InvoicesProvider>
  )
}
