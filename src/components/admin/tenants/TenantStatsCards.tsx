import { Building2, Activity, Play, Ban, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTenantStats } from '@/api/tenants.api'
import { Skeleton } from '@/components/ui/skeleton'

export const TenantStatsCards = () => {
  const { data: stats, isLoading } = useTenantStats()

  if (isLoading) {
    return (
      <div className='flex flex-col gap-4 mb-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='pb-2'>
                <Skeleton className='h-4 w-24' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-12' />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className='h-12 w-full rouded-lg' />
      </div>
    )
  }

  const { total, statuses, plans } = stats || {
    total: 0,
    statuses: { active: 0, trial: 0, suspended: 0, expired: 0 },
    plans: { free: 0, starter: 0, professional: 0, enterprise: 0 }
  }

  return (
    <div className='flex flex-col gap-4 mb-6'>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Tenants</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <Activity className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statuses.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>In Trial</CardTitle>
            <Play className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statuses.trial}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Suspended</CardTitle>
            <Ban className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statuses.suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Expired</CardTitle>
            <AlertCircle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{statuses.expired}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Distribution Bar */}
      <div className='rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-sm text-center md:text-left flex items-center gap-4 flex-wrap'>
        <span className='font-medium text-muted-foreground'>Plan Distribution:</span>
        <div className='flex gap-4'>
          <span className='whitespace-nowrap'>Free: <span className='font-semibold'>{plans.free}</span></span>
          <span className='whitespace-nowrap'>Starter: <span className='font-semibold'>{plans.starter}</span></span>
          <span className='whitespace-nowrap'>Pro: <span className='font-semibold'>{plans.professional}</span></span>
          <span className='whitespace-nowrap'>Enterprise: <span className='font-semibold'>{plans.enterprise}</span></span>
        </div>
      </div>
    </div>
  )
}

