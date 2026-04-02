import {
  Building2,
  Users,
  UserCheck,
  DollarSign,
  Bot,
  FileText,
} from 'lucide-react'
import { usePlanDistribution, useBillingOverview } from '@/api/billing.api'
import { useUsers } from '@/api/users.api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentActivity } from './components/recent-activity'

export function Dashboard() {
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1 })
  const { data: activeUsersData, isLoading: isLoadingActiveUsers } = useUsers({
    status: 'active',
    limit: 1,
  })
  const { data: overview, isLoading: isLoadingOverview } = useBillingOverview()
  const { data: distributionData, isLoading: isLoadingTenants } =
    usePlanDistribution()

  const totalTenants = distributionData
    ? distributionData.reduce((sum, d) => sum + d.tenantCount, 0)
    : 0

  const formatPercentage = (val?: number) => {
    if (val === undefined) return '0%'
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`
  }
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
          <div className='flex items-center space-x-2'>
            <Button>Download</Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              <TabsTrigger value='reports' disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Tenants
                  </CardTitle>
                  <Building2 className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  {isLoadingTenants ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>{totalTenants}</div>
                  )}
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Platform-wide tenants
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Users
                  </CardTitle>
                  <Users className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>
                      {usersData?.meta.total || 0}
                    </div>
                  )}
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Registered users
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Users
                  </CardTitle>
                  <UserCheck className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  {isLoadingActiveUsers ? (
                    <Skeleton className='h-8 w-16' />
                  ) : (
                    <div className='text-2xl font-bold'>
                      {activeUsersData?.meta.total || 0}
                    </div>
                  )}
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Users with active status
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>MRR</CardTitle>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  {isLoadingOverview ? (
                    <Skeleton className='h-8 w-24' />
                  ) : (
                    <div className='text-2xl font-bold'>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(overview?.mrr || 0)}
                    </div>
                  )}
                  <p
                    className={`mt-1 text-xs ${overview && overview.revenueGrowthPercent > 0 ? 'text-green-500' : overview && overview.revenueGrowthPercent < 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    {overview
                      ? `${formatPercentage(overview.revenueGrowthPercent)} from last month`
                      : 'Calculating...'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Chatbots
                  </CardTitle>
                  <Bot className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-muted-foreground'>
                    N/A
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Data pipeline pending
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Documents
                  </CardTitle>
                  <FileText className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-muted-foreground'>
                    N/A
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Data pipeline pending
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions across the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value='analytics' className='space-y-4'>
            <Analytics />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
