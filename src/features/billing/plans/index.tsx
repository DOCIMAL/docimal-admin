import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { PlanCards } from './components/plan-cards'
import { PlanDistributionChart } from './components/plan-distribution-chart'
import { PlanSyncButton } from './components/plan-sync-button'

export function Plans() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Page header */}
        <div className='flex flex-col items-baseline justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Subscription Plans
            </h2>
            <p className='text-muted-foreground'>
              Manage subscription plans, monitor revenue and tenant allocation.
            </p>
          </div>
          <PlanSyncButton />
        </div>

        {/* Plan cards grid */}
        <PlanCards />

        {/* Distribution chart */}
        <PlanDistributionChart />
      </Main>
    </>
  )
}
