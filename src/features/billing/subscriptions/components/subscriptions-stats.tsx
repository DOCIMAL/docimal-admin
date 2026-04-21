import { useMemo } from 'react'
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import { useAdminSubscriptions } from '@/api/billing.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SubscriptionsStats() {
  // Fetch all subscriptions (with high limit) to calculate stats
  const { data: listData, isLoading } = useAdminSubscriptions({ limit: 1000 })

  // Calculate stats from all subscriptions
  const stats = useMemo(() => {
    if (!listData?.items) {
      return { active: 0, trialing: 0, canceled: 0, pastDue: 0 }
    }

    return {
      active: listData.items.filter((s) => s.status === 'active').length,
      trialing: listData.items.filter((s) => s.status === 'trialing').length,
      canceled: listData.items.filter((s) => s.status === 'canceled').length,
      pastDue: listData.items.filter((s) => s.status === 'past_due').length,
    }
  }, [listData])

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, idx) => (
          <Card key={idx} className='gap-2 py-4'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
              <CardTitle className='text-sm font-medium'>
                <Skeleton className='h-4 w-20' />
              </CardTitle>
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-12' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {/* Active Subscriptions */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Active</CardTitle>
          <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.active}</div>
          <p className='text-xs text-muted-foreground'>Active subscriptions</p>
        </CardContent>
      </Card>

      {/* Trialing Subscriptions */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Trialing</CardTitle>
          <Clock className='h-4 w-4 text-amber-600 dark:text-amber-400' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.trialing}</div>
          <p className='text-xs text-muted-foreground'>Trial subscriptions</p>
        </CardContent>
      </Card>

      {/* Canceled Subscriptions */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Canceled</CardTitle>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.canceled}</div>
          <p className='text-xs text-muted-foreground'>
            Canceled subscriptions
          </p>
        </CardContent>
      </Card>

      {/* Past Due Subscriptions */}
      <Card className='gap-2 py-4'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-0'>
          <CardTitle className='text-sm font-medium'>Past Due</CardTitle>
          <AlertCircle className='h-4 w-4 text-orange-600 dark:text-orange-400' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.pastDue}</div>
          <p className='text-xs text-muted-foreground'>Overdue subscriptions</p>
        </CardContent>
      </Card>
    </div>
  )
}
