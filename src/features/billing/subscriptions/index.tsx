import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { SubscriptionsProvider } from './components/subscriptions-provider'
import { SubscriptionsStats } from './components/subscriptions-stats'
import { SubscriptionsTable } from './components/subscriptions-table'

const route = getRouteApi('/_authenticated/billing/subscriptions')

export function Subscriptions() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <SubscriptionsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Subscriptions</h2>
          <p className='text-muted-foreground'>
            Manage all tenant subscriptions and billing plans.
          </p>
        </div>

        {/* Stats Cards */}
        <SubscriptionsStats />

        {/* Table */}
        <SubscriptionsTable search={search} navigate={navigate} />
      </Main>
    </SubscriptionsProvider>
  )
}
