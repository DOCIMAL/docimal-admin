import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { useRevenueChart } from '@/api/billing.api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PlanDistributionChart } from '@/features/billing/plans/components/plan-distribution-chart'

export function Analytics() {
  const { data: response, isLoading } = useRevenueChart(12)

  const data =
    response?.data.map((item) => {
      const [year, month] = item.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return {
        name: date.toLocaleString('en-US', { month: 'short' }),
        revenue: item.revenue,
      }
    }) || []

  return (
    <div className='space-y-4'>
      <PlanDistributionChart />

      <Card>
        <CardHeader>
          <CardTitle>MRR Growth</CardTitle>
          <CardDescription>
            Monthly Recurring Revenue growth over the last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          {isLoading ? (
            <Skeleton className='h-[350px] w-full' />
          ) : (
            <div className='h-[350px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    vertical={false}
                    stroke='#e5e7eb'
                  />
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
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: number | string | undefined) => [
                      `$${value || 0}`,
                      'MRR',
                    ]}
                  />
                  <Line
                    type='monotone'
                    dataKey='revenue'
                    stroke='#3b82f6'
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
