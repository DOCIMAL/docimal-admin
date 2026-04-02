import { useAdminInvoices } from '@/api/billing.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

export function InvoicesStats() {
  // Use limit=1 just to fetch the summary reliably, or limit 0 if API allows empty
  const { data: listData, isLoading } = useAdminInvoices({ limit: 1 })

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {[...Array(3)].map((_, idx) => (
          <Card key={idx} className='py-4 gap-2'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
              <CardTitle className='text-sm font-medium'>
                <Skeleton className='h-4 w-24' />
              </CardTitle>
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent className='px-6 pb-4 pt-1'>
              <Skeleton className='h-8 w-24' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const summary = listData?.summary || {
    totalPaidThisMonth: 0,
    totalPaidLastMonth: 0,
    totalOutstanding: 0,
  }

  // Calculate percentage change
  const diff = summary.totalPaidThisMonth - summary.totalPaidLastMonth
  let growthComponent = null

  if (summary.totalPaidLastMonth > 0) {
    const percent = Math.abs((diff / summary.totalPaidLastMonth) * 100).toFixed(1)
    if (diff > 0) {
      growthComponent = (
        <span className='flex items-center text-xs text-green-500'>
          <ArrowUpRight className='mr-1 h-3 w-3' />
          +{percent}% from last month
        </span>
      )
    } else if (diff < 0) {
      growthComponent = (
        <span className='flex items-center text-xs text-red-500'>
          <ArrowDownRight className='mr-1 h-3 w-3' />
          -{percent}% from last month
        </span>
      )
    } else {
      growthComponent = <span className='text-xs text-muted-foreground'>No change from last month</span>
    }
  } else if (summary.totalPaidThisMonth > 0) {
    growthComponent = <span className='text-xs text-muted-foreground'>+100% from last month</span>
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {/* Revenue This Month */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Revenue This Month</CardTitle>
          <DollarSign className='h-4 w-4 text-green-600 dark:text-green-400' />
        </CardHeader>
        <CardContent className='px-6 pb-4 pt-1 text-left'>
          <div className='text-2xl font-bold'>
            {formatCurrency(summary.totalPaidThisMonth)}
          </div>
          {growthComponent || <p className='text-xs text-muted-foreground mt-1'>0% from last month</p>}
        </CardContent>
      </Card>

      {/* Revenue Last Month */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Revenue Last Month</CardTitle>
          <DollarSign className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent className='px-6 pb-4 pt-1 text-left'>
          <div className='text-2xl font-bold opacity-80'>
            {formatCurrency(summary.totalPaidLastMonth)}
          </div>
          <p className='text-xs text-muted-foreground mt-1'>Total revenue last month</p>
        </CardContent>
      </Card>

      {/* Outstanding Balance */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Outstanding Balance</CardTitle>
          <Clock className='h-4 w-4 text-amber-600 dark:text-amber-400' />
        </CardHeader>
        <CardContent className='px-6 pb-4 pt-1 text-left'>
          <div className='text-2xl font-bold'>
            {formatCurrency(summary.totalOutstanding)}
          </div>
          <p className='text-xs text-muted-foreground mt-1'>Open or overdue invoices</p>
        </CardContent>
      </Card>
    </div>
  )
}
