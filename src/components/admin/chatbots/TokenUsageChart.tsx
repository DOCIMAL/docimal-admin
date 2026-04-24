import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AdminChatbotDetailStats } from '@/api/admin-chatbots.api'
import { format } from 'date-fns'

interface TokenUsageChartProps {
  stats?: AdminChatbotDetailStats
  isLoading?: boolean
}

export function TokenUsageChart({ stats, isLoading }: TokenUsageChartProps) {
  if (isLoading) {
    return (
      <Card className='col-span-1 lg:col-span-2'>
        <CardHeader>
          <CardTitle>Usage Over Time</CardTitle>
          <CardDescription>30-day trend of conversations and tokens.</CardDescription>
        </CardHeader>
        <CardContent className='h-[350px] flex items-center justify-center'>
          <div className='flex items-center space-x-2'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
            <span>Loading chart data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const data = stats?.usageHistory || []

  // Function to format X-axis dates
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd')
    } catch {
      return dateStr
    }
  }

  return (
    <Card className='col-span-1 lg:col-span-2'>
      <CardHeader>
        <CardTitle>Usage Activity</CardTitle>
        <CardDescription>Daily breakdown of conversations and token consumption.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='h-[350px] w-full mt-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='colorTokens' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='rgb(234, 179, 8)' stopOpacity={0.1} />
                  <stop offset='95%' stopColor='rgb(234, 179, 8)' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorConvos' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='rgb(59, 130, 246)' stopOpacity={0.1} />
                  <stop offset='95%' stopColor='rgb(59, 130, 246)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f0f0f0' />
              <XAxis 
                dataKey='date' 
                tickFormatter={formatDate}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='#888888'
              />
              <YAxis 
                yAxisId='left'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='#888888'
                tickFormatter={(value) => `${value}`}
              />
              <YAxis 
                yAxisId='right'
                orientation='right'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke='#888888'
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                labelFormatter={(label) => format(new Date(label), 'MMMM dd, yyyy')}
              />
              <Legend verticalAlign='top' align='right' height={36} iconType='circle' />
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='conversations'
                name='Conversations'
                stroke='#3b82f6'
                fillOpacity={1}
                fill='url(#colorConvos)'
                strokeWidth={2}
              />
              <Area
                yAxisId='right'
                type='monotone'
                dataKey='tokens'
                name='Tokens Used'
                stroke='#eab308'
                fillOpacity={1}
                fill='url(#colorTokens)'
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
