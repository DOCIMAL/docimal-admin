import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useRevenueChart } from '@/api/billing.api'
import { Skeleton } from '@/components/ui/skeleton'

export function Overview() {
  const { data: response, isLoading } = useRevenueChart(12)

  if (isLoading) {
    return <Skeleton className='h-[350px] w-full' />
  }

  const data =
    response?.data.map((item) => {
      const [year, month] = item.month.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return {
        name: date.toLocaleString('en-US', { month: 'short' }),
        total: item.revenue,
      }
    }) || []
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
