import { Activity, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react'
import { useAuditStats } from '@/hooks/useAuditLogs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const AuditStatsBar = () => {
  const { data: stats, isLoading } = useAuditStats()

  if (isLoading) {
    return (
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 w-24 rounded bg-muted' />
              <div className='h-4 w-4 rounded bg-muted' />
            </CardHeader>
            <CardContent>
              <div className='mb-2 h-8 w-16 rounded bg-muted' />
              <div className='h-3 w-32 rounded bg-muted' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const total = stats?.totalLogs || 0
  const success = stats?.byStatus?.SUCCESS || 0
  const failed = stats?.byStatus?.FAILED || 0
  const highSev =
    (stats?.bySeverity?.CRITICAL || 0) + (stats?.bySeverity?.WARNING || 0)

  const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : '0.0'
  const failedRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0'

  const statItems = [
    {
      label: 'Total Logs',
      value: total.toLocaleString(),
      subValue: 'All actions recorded',
      icon: Activity,
      color: 'text-blue-500 dark:text-blue-400',
    },
    {
      label: 'Success Rate',
      value: `${successRate}%`,
      subValue: `${success.toLocaleString()} operations`,
      icon: CheckCircle2,
      color: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      label: 'Failed Actions',
      value: failed.toLocaleString(),
      subValue: `${failedRate}% of total`,
      icon: AlertCircle,
      color: 'text-destructive dark:text-rose-400',
    },
    {
      label: 'High Severity',
      value: highSev.toLocaleString(),
      subValue: 'Security & Critical',
      icon: ShieldAlert,
      color: 'text-orange-500 dark:text-orange-400',
    },
  ]

  return (
    <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{item.label}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{item.value}</div>
            <p className='mt-1 text-xs text-muted-foreground'>
              {item.subValue}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
