import { useMemo } from 'react'
import { usePlanDistribution } from '@/api/billing.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const PLAN_COLORS: Record<string, string> = {
  free: '#a1a1aa',          // zinc-400
  starter: '#3b82f6',       // blue-500
  professional: '#8b5cf6',  // violet-500
  enterprise: '#3f3f46',    // zinc-700
}

function getPlanColor(planName: string): string {
  const key = planName.toLowerCase()
  return PLAN_COLORS[key] ?? '#6b7280'
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: { name: string; color: string; tenantCount: number; percentage: number; monthlyRecurringRevenue: number }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className='rounded-lg border bg-background p-3 shadow-md text-sm'>
      <p className='font-semibold mb-1 capitalize'>{item.name}</p>
      <p className='text-muted-foreground'>
        Tenants: <span className='text-foreground font-medium'>{item.tenantCount}</span>
      </p>
      <p className='text-muted-foreground'>
        Share:{' '}
        <span className='text-foreground font-medium'>
          {item.percentage.toFixed(1)}%
        </span>
      </p>
      <p className='text-muted-foreground'>
        MRR:{' '}
        <span className='text-foreground font-medium'>
          {formatCurrency(item.monthlyRecurringRevenue)}
        </span>
      </p>
    </div>
  )
}

export function PlanDistributionChart() {
  const { data: distribution, isLoading, isError } = usePlanDistribution()

  const chartData = useMemo(() => {
    if (!distribution) return []

    // Group by plan name since backend returns variant per interval
    const grouped = distribution.reduce((acc, d) => {
      const name = d.planName.toLowerCase()
      if (!acc[name]) {
        acc[name] = {
          id: name,
          name: d.planName.charAt(0).toUpperCase() + d.planName.slice(1),
          tenantCount: 0,
          monthlyRecurringRevenue: 0,
          color: getPlanColor(d.planName),
        }
      }
      acc[name].tenantCount += d.tenantCount
      acc[name].monthlyRecurringRevenue += d.monthlyRecurringRevenue
      return acc
    }, {} as Record<string, { id: string; name: string; tenantCount: number; monthlyRecurringRevenue: number; color: string }>)

    const totalTenants = Object.values(grouped).reduce((sum, g) => sum + g.tenantCount, 0)

    return Object.values(grouped).map((g) => ({
      ...g,
      percentage: totalTenants > 0 ? (g.tenantCount / totalTenants) * 100 : 0,
    })).sort((a, b) => {
      // Sort by tenant count descending, but keep Free at the bottom
      if (a.id === 'free') return 1
      if (b.id === 'free') return -1
      return b.tenantCount - a.tenantCount
    })
  }, [distribution])

  const totalTenants = chartData.reduce((sum, d) => sum + d.tenantCount, 0)
  const totalMrr = chartData.reduce((sum, d) => sum + d.monthlyRecurringRevenue, 0)

  return (
    <Card>
      <CardHeader className='pb-6 flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-base font-semibold'>
            Tenant Distribution by Plan
          </CardTitle>
          <p className='text-xs text-muted-foreground mt-1'>
            How your tenants are distributed across subscription plans
          </p>
        </div>
        <div className='flex gap-4 text-right'>
           <div>
             <p className='text-sm font-semibold'>{totalTenants}</p>
             <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-semibold'>Total Tenants</p>
           </div>
           <div>
             <p className='text-sm font-semibold tabular-nums'>{formatCurrency(totalMrr)}</p>
             <p className='text-[10px] text-muted-foreground uppercase tracking-wider font-semibold'>Total MRR</p>
           </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <Skeleton className='h-[240px] w-full rounded-xl lg:col-span-1' />
            <div className='lg:col-span-1 space-y-3'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='flex items-center gap-3'>
                  <Skeleton className='h-8 w-full' />
                </div>
              ))}
            </div>
          </div>
        ) : isError ? (
          <p className='text-sm text-destructive'>Failed to load distribution data.</p>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
            {/* Bar chart - 1/2 width */}
            <div className='relative h-[250px] w-full lg:col-span-1 min-w-0'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#e5e7eb' />
                  <XAxis 
                    dataKey='name' 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    allowDecimals={false}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                  <Bar dataKey='tenantCount' radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats list - 1/2 width */}
            <div className='w-full lg:col-span-1 overflow-x-auto min-w-0 ml-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/60 text-left'>
                    <th className='py-3 px-3 w-1/3'>Plan</th>
                    <th className='py-3 px-4 w-1/6'>Tenants</th>
                    <th className='py-3 px-4 w-1/6'>Share</th>
                    <th className='py-3 px-4 w-1/3 hidden sm:table-cell'>MRR</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border/40'>
                  {chartData.map((d) => (
                    <tr
                      key={d.id}
                      className='transition-colors hover:bg-muted/50 group'
                    >
                      <td className='py-3.5 px-3'>
                        <div className='flex items-center gap-3'>
                          <span
                            className='h-2.5 w-2.5 rounded-full shrink-0'
                            style={{ backgroundColor: d.color }}
                          />
                          <span className='text-sm font-medium'>{d.name}</span>
                        </div>
                      </td>
                      <td className='py-3.5 px-4 text-sm font-medium tabular-nums'>
                        {d.tenantCount}
                      </td>
                      <td className='py-3.5 px-4 text-sm text-muted-foreground tabular-nums'>
                        {d.percentage.toFixed(1)}%
                      </td>
                      <td className='py-3.5 px-4 text-sm font-medium hidden sm:table-cell tabular-nums'>
                        {formatCurrency(d.monthlyRecurringRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

