import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAdminInvoices } from '@/api/billing.api'
import { Skeleton } from '@/components/ui/skeleton'

export function RecentActivity() {
  const { data: response, isLoading } = useAdminInvoices({ limit: 5 })

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Skeleton className='h-9 w-9 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-[250px]' />
              <Skeleton className='h-4 w-[200px]' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const invoices = response?.data || []

  if (invoices.length === 0) {
    return <div className="text-center text-sm text-muted-foreground my-8">No recent activity</div>
  }

  return (
    <div className='space-y-8'>
      {invoices.map((invoice) => {
        const fallback = invoice.tenantName?.slice(0, 2).toUpperCase() || 'TE'
        const currencyStr = invoice.currency ? invoice.currency.toUpperCase() : 'USD'
        return (
          <div key={invoice.id} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>{invoice.tenantName}</p>
                <p className='text-sm text-muted-foreground'>
                  Invoice {invoice.stripeInvoiceId ? `#${invoice.stripeInvoiceId.split('_').pop()?.slice(0, 8)}` : invoice.id.slice(0, 8)}
                </p>
              </div>
              <div className='font-medium'>
                +{new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyStr }).format(invoice.amountPaid)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
