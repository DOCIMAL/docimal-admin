import {
  LayoutDashboard,
  Users,
  Building2,
  Bot,
  Settings,
  Search,
  Bell,
  TrendingUp,
  ArrowUpRight,
  UserCheck,
  DollarSign,
} from 'lucide-react'
import { ResponsiveContainer, Area, AreaChart } from 'recharts'
import { Logo } from '@/assets/logo'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 600 },
  { name: 'Thu', value: 800 },
  { name: 'Fri', value: 500 },
  { name: 'Sat', value: 900 },
  { name: 'Sun', value: 700 },
]

const PARTICLES = [
  {
    color: 'bg-red-500',
    size: 'w-3 h-3',
    initialX: 20,
    initialY: 30,
    animation: 'animate-blob-float',
  },
  {
    color: 'bg-emerald-500',
    size: 'w-4 h-4',
    initialX: 70,
    initialY: 20,
    animation: 'animate-blob-float-delayed',
  },
  {
    color: 'bg-purple-500',
    size: 'w-2 h-2',
    initialX: 40,
    initialY: 80,
    animation: 'animate-blob-pulse',
  },
  {
    color: 'bg-yellow-400',
    size: 'w-3 h-3',
    initialX: 80,
    initialY: 60,
    animation: 'animate-blob-float',
  },
  {
    color: 'bg-red-400',
    size: 'w-2 h-2',
    initialX: 10,
    initialY: 60,
    animation: 'animate-blob-float-delayed',
  },
  {
    color: 'bg-emerald-400',
    size: 'w-3 h-3',
    initialX: 90,
    initialY: 10,
    animation: 'animate-blob-pulse',
  },
  {
    color: 'bg-purple-400',
    size: 'w-3 h-3',
    initialX: 15,
    initialY: 90,
    animation: 'animate-blob-float',
  },
  {
    color: 'bg-yellow-500',
    size: 'w-4 h-4',
    initialX: 60,
    initialY: 85,
    animation: 'animate-blob-float-delayed',
  },
  {
    color: 'bg-red-500',
    size: 'w-4 h-4',
    initialX: 10,
    initialY: 10,
    animation: 'animate-blob-pulse',
  },
  {
    color: 'bg-blue-500',
    size: 'w-4 h-4',
    initialX: 20,
    initialY: 20,
    animation: 'animate-blob-float',
  },
  {
    color: 'bg-red-500',
    size: 'w-4 h-4',
    initialX: 80,
    initialY: 80,
    animation: 'animate-blob-float-delayed',
  },
  {
    color: 'bg-yellow-500',
    size: 'w-4 h-4',
    initialX: 25,
    initialY: 5,
    animation: 'animate-blob-pulse',
  },
]

export function DashboardMockup() {
  return (
    <div className='relative flex h-full w-full animate-in flex-col items-center justify-center overflow-hidden p-8 duration-1000 fade-in'>
      {/* Background Particles */}
      <div className='pointer-events-none absolute inset-0 z-0'>
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-40 blur-[1px] ${p.color} ${p.size} ${p.animation}`}
            style={{
              left: `${p.initialX}%`,
              top: `${p.initialY}%`,
            }}
          />
        ))}
      </div>

      {/* Background decoration (larger blobs) */}
      <div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
        <div className='animate-blob-float absolute -top-[10%] -left-[10%] h-[50%] w-[50%] rounded-full bg-primary/20 blur-[120px]' />
        <div className='animate-blob-float-delayed absolute -right-[10%] -bottom-[10%] h-[50%] w-[50%] rounded-full bg-blue-500/20 blur-[120px]' />
        <div className='animate-blob-pulse absolute top-[20%] right-[20%] h-[30%] w-[30%] rounded-full bg-purple-500/10 blur-[100px]' />
        <div className='animate-blob-pulse absolute bottom-[30%] left-[30%] h-[25%] w-[25%] rounded-full bg-emerald-500/10 blur-[80px] delay-700' />
      </div>

      {/* Browser Window Mockup */}
      <div className='relative z-10 flex aspect-[14/10] w-full max-w-[1000px] origin-top-left translate-x-12 translate-y-8 scale-110 -rotate-1 flex-col overflow-hidden rounded-xl border bg-background shadow-2xl backdrop-blur-[2px]'>
        {/* Browser Top Bar */}
        <div className='flex h-10 shrink-0 items-center border-b bg-muted/30 px-4'>
          <div className='mr-4 flex gap-2'>
            <div className='h-3 w-3 rounded-full bg-red-400' />
            <div className='h-3 w-3 rounded-full bg-amber-400' />
            <div className='h-3 w-3 rounded-full bg-emerald-400' />
          </div>
          <div className='flex flex-1 justify-center'>
            <div className='flex h-6 w-full max-w-sm items-center gap-2 rounded-md bg-muted px-3 text-[10px] text-muted-foreground'>
              <div className='h-2 w-2 rounded-full bg-emerald-500' />
              admin.docimal.com
            </div>
          </div>
        </div>

        <div className='flex flex-1 overflow-hidden'>
          {/* Mock Sidebar */}
          <div className='w-48 shrink-0 space-y-4 border-r bg-muted/10 p-4 max-lg:hidden'>
            <div className='mb-8 flex h-6 w-24 items-center rounded-md bg-primary/1'>
              <Logo className='me-2' />
              <h1 className='text-sm font-medium text-primary'>Docimal</h1>
            </div>
            {[
              { icon: LayoutDashboard, label: 'Overview', active: true },
              { icon: Building2, label: 'Tenants' },
              { icon: Users, label: 'Users' },
              { icon: Bot, label: 'Chatbots' },
              { icon: Settings, label: 'Settings' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
              >
                <item.icon className='h-4 w-4' />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main Content Mock */}
          <div className='flex-1 space-y-6 overflow-hidden bg-background/50 p-6 backdrop-blur-md'>
            <div className='flex items-end justify-between'>
              <div className='space-y-1'>
                <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                <div className='h-8 w-48 rounded bg-foreground/10' />
              </div>
              <div className='flex gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted p-2'>
                  <Search className='h-4 w-4 text-muted-foreground' />
                </div>
                <div className='relative flex h-8 w-8 items-center justify-center rounded-full bg-muted p-2'>
                  <Bell className='h-4 w-4 text-muted-foreground' />
                  <div className='absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary' />
                </div>
                <div className='h-8 w-8 rounded-full bg-muted' />
              </div>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              {[
                {
                  label: 'Total MRR',
                  value: '$24.5k',
                  trend: '+12%',
                  icon: DollarSign,
                },
                {
                  label: 'Active Users',
                  value: '1.2k',
                  trend: '+5%',
                  icon: UserCheck,
                },
                {
                  label: 'Bot Success',
                  value: '98%',
                  trend: '+2%',
                  icon: TrendingUp,
                },
              ].map((stat, i) => (
                <Card key={i} className='bg-background/80'>
                  <CardHeader className='flex flex-row items-center justify-between p-4 pb-0'>
                    <div className='text-[10px] font-semibold text-muted-foreground uppercase'>
                      {stat.label}
                    </div>
                    <stat.icon className='h-4 w-4 text-primary' />
                  </CardHeader>
                  <CardContent className='p-4 pt-1'>
                    <div className='text-xl font-bold'>{stat.value}</div>
                    <div className='flex items-center gap-1 text-[10px] font-medium text-emerald-500'>
                      <ArrowUpRight className='h-2.5 w-2.5' />
                      {stat.trend}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='grid h-48 grid-cols-2 gap-4'>
              <Card className='flex flex-col overflow-hidden bg-background/80 p-4'>
                <div className='mb-4 text-[10px] font-semibold text-muted-foreground uppercase'>
                  Live Traffic
                </div>
                <div className='w-full flex-1'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id='colorValue'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='var(--primary)'
                            stopOpacity={0.3}
                          />
                          <stop
                            offset='95%'
                            stopColor='var(--primary)'
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type='monotone'
                        dataKey='value'
                        stroke='var(--primary)'
                        fillOpacity={1}
                        fill='url(#colorValue)'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className='flex flex-col space-y-3 bg-background/80 p-4'>
                <div className='text-[10px] font-semibold text-muted-foreground uppercase'>
                  Recent Users
                </div>
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className='flex items-center gap-3'>
                    <div className='h-8 w-8 shrink-0 rounded-full bg-muted' />
                    <div className='flex-1 space-y-1.5'>
                      <div
                        className={`h-2.5 rounded bg-muted w-${i === 0 ? '3/4' : i === 1 ? '1/2' : '2/3'}`}
                      />
                      <div className='h-2 w-1/3 rounded bg-muted/50' />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
