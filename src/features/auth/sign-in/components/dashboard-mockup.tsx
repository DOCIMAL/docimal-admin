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
    DollarSign
} from 'lucide-react'
import {
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Logo } from '@/assets/logo'

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
    { color: 'bg-red-500', size: 'w-3 h-3', initialX: 20, initialY: 30, animation: 'animate-blob-float' },
    { color: 'bg-emerald-500', size: 'w-4 h-4', initialX: 70, initialY: 20, animation: 'animate-blob-float-delayed' },
    { color: 'bg-purple-500', size: 'w-2 h-2', initialX: 40, initialY: 80, animation: 'animate-blob-pulse' },
    { color: 'bg-yellow-400', size: 'w-3 h-3', initialX: 80, initialY: 60, animation: 'animate-blob-float' },
    { color: 'bg-red-400', size: 'w-2 h-2', initialX: 10, initialY: 60, animation: 'animate-blob-float-delayed' },
    { color: 'bg-emerald-400', size: 'w-3 h-3', initialX: 90, initialY: 10, animation: 'animate-blob-pulse' },
    { color: 'bg-purple-400', size: 'w-3 h-3', initialX: 15, initialY: 90, animation: 'animate-blob-float' },
    { color: 'bg-yellow-500', size: 'w-4 h-4', initialX: 60, initialY: 85, animation: 'animate-blob-float-delayed' },
    { color: 'bg-red-500', size: 'w-4 h-4', initialX: 10, initialY: 10, animation: 'animate-blob-pulse' },
    { color: 'bg-blue-500', size: 'w-4 h-4', initialX: 20, initialY: 20, animation: 'animate-blob-float' },
    { color: 'bg-red-500', size: 'w-4 h-4', initialX: 80, initialY: 80, animation: 'animate-blob-float-delayed' },
    { color: 'bg-yellow-500', size: 'w-4 h-4', initialX: 25, initialY: 5, animation: 'animate-blob-pulse' },
]

export function DashboardMockup() {
    return (
        <div
            className='relative w-full h-full p-8 flex flex-col items-center justify-center animate-in fade-in duration-1000 overflow-hidden'
        >
            {/* Background Particles */}
            <div className='absolute inset-0 z-0 pointer-events-none'>
                {PARTICLES.map((p, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full blur-[1px] opacity-40 ${p.color} ${p.size} ${p.animation}`}
                        style={{
                            left: `${p.initialX}%`,
                            top: `${p.initialY}%`,
                        }}
                    />
                ))}
            </div>

            {/* Background decoration (larger blobs) */}
            <div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
                <div className='absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-blob-float' />
                <div className='absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-blob-float-delayed' />
                <div className='absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full animate-blob-pulse' />
                <div className='absolute bottom-[30%] left-[30%] w-[25%] h-[25%] bg-emerald-500/10 blur-[80px] rounded-full animate-blob-pulse delay-700' />
            </div>

            {/* Browser Window Mockup */}
            <div className='relative z-10 w-full max-w-[1000px] aspect-[14/10] bg-background border rounded-xl shadow-2xl overflow-hidden flex flex-col scale-110 origin-top-left -rotate-1 translate-x-12 translate-y-8 backdrop-blur-[2px]'>
                {/* Browser Top Bar */}
                <div className='h-10 border-b bg-muted/30 flex items-center px-4 shrink-0'>
                    <div className='flex gap-2 mr-4'>
                        <div className='w-3 h-3 rounded-full bg-red-400' />
                        <div className='w-3 h-3 rounded-full bg-amber-400' />
                        <div className='w-3 h-3 rounded-full bg-emerald-400' />
                    </div>
                    <div className='flex-1 flex justify-center'>
                        <div className='w-full max-w-sm h-6 bg-muted rounded-md flex items-center px-3 text-[10px] text-muted-foreground gap-2'>
                            <div className='w-2 h-2 rounded-full bg-emerald-500' />
                            admin.docimal.com
                        </div>
                    </div>
                </div>

                <div className='flex-1 flex overflow-hidden'>
                    {/* Mock Sidebar */}
                    <div className='w-48 border-r bg-muted/10 p-4 space-y-4 shrink-0 max-lg:hidden'>
                        <div className='h-6 w-24 bg-primary/1 rounded-md mb-8 flex items-center' >
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
                            <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium ${item.active ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                                <item.icon className='w-4 h-4' />
                                {item.label}
                            </div>
                        ))}
                    </div>

                    {/* Main Content Mock */}
                    <div className='flex-1 p-6 space-y-6 overflow-hidden bg-background/50 backdrop-blur-md'>
                        <div className='flex justify-between items-end'>
                            <div className='space-y-1'>
                                <div className='h-4 w-32 bg-muted rounded animate-pulse' />
                                <div className='h-8 w-48 bg-foreground/10 rounded' />
                            </div>
                            <div className='flex gap-2'>
                                <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center p-2'>
                                    <Search className='w-4 h-4 text-muted-foreground' />
                                </div>
                                <div className='w-8 h-8 rounded-full bg-muted flex items-center justify-center p-2 relative'>
                                    <Bell className='w-4 h-4 text-muted-foreground' />
                                    <div className='absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full' />
                                </div>
                                <div className='w-8 h-8 rounded-full bg-muted' />
                            </div>
                        </div>

                        <div className='grid grid-cols-3 gap-4'>
                            {[
                                { label: 'Total MRR', value: '$24.5k', trend: '+12%', icon: DollarSign },
                                { label: 'Active Users', value: '1.2k', trend: '+5%', icon: UserCheck },
                                { label: 'Bot Success', value: '98%', trend: '+2%', icon: TrendingUp },
                            ].map((stat, i) => (
                                <Card key={i} className='bg-background/80'>
                                    <CardHeader className='p-4 pb-0 flex flex-row items-center justify-between'>
                                        <div className='text-[10px] text-muted-foreground uppercase font-semibold'>
                                            {stat.label}
                                        </div>
                                        <stat.icon className='w-4 h-4 text-primary' />
                                    </CardHeader>
                                    <CardContent className='p-4 pt-1'>
                                        <div className='text-xl font-bold'>{stat.value}</div>
                                        <div className='text-[10px] text-emerald-500 font-medium flex items-center gap-1'>
                                            <ArrowUpRight className='w-2.5 h-2.5' />
                                            {stat.trend}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className='grid grid-cols-2 gap-4 h-48'>
                            <Card className='bg-background/80 overflow-hidden flex flex-col p-4'>
                                <div className='text-[10px] text-muted-foreground uppercase font-semibold mb-4'>
                                    Live Traffic
                                </div>
                                <div className='flex-1 w-full'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                                                    <stop offset='5%' stopColor='var(--primary)' stopOpacity={0.3} />
                                                    <stop offset='95%' stopColor='var(--primary)' stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type='monotone' dataKey='value' stroke='var(--primary)' fillOpacity={1} fill='url(#colorValue)' />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className='bg-background/80 p-4 flex flex-col space-y-3'>
                                <div className='text-[10px] text-muted-foreground uppercase font-semibold'>
                                    Recent Users
                                </div>
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className='flex items-center gap-3'>
                                        <div className='w-8 h-8 rounded-full bg-muted shrink-0' />
                                        <div className='flex-1 space-y-1.5'>
                                            <div className={`h-2.5 bg-muted rounded w-${i === 0 ? '3/4' : i === 1 ? '1/2' : '2/3'}`} />
                                            <div className='h-2 bg-muted/50 rounded w-1/3' />
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
