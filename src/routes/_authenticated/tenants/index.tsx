import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { ListTenantsParams, useTenants, useActivateTenant, Tenant } from '@/api/tenants.api'
import { TenantStatsCards } from '@/components/admin/tenants/TenantStatsCards'
import { TenantFilters } from '@/components/admin/tenants/TenantFilters'
import { TenantDataTable } from '@/components/admin/tenants/tenant-table/data-table'
import { SuspendTenantDialog } from '@/components/admin/tenants/dialogs/SuspendTenantDialog'
import { ExtendTrialDialog } from '@/components/admin/tenants/dialogs/ExtendTrialDialog'

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/tenants/')({
  component: TenantsListPage,
})

function TenantsListPage() {
  const [filters, setFilters] = useState<ListTenantsParams>({
    page: 1,
    limit: 10,
  })

  const { data, isLoading } = useTenants(filters)
  const { mutate: activateTenant } = useActivateTenant()

  // Dialog states
  const [tenantToSuspend, setTenantToSuspend] = useState<Tenant | null>(null)
  const [tenantToExtend, setTenantToExtend] = useState<Tenant | null>(null)

  const handleFilterChange = (newFilters: Partial<ListTenantsParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleActivate = (tenant: Tenant) => {
    activateTenant(tenant.id)
  }

  const handleExtend = (tenant: Tenant) => {
    setTenantToExtend(tenant)
  }

  const totalPages = data?.meta?.totalPages || 1
  const currentPage = filters.page || 1

  return (
    <>
      <Header>
        <TopNav links={[{ title: 'Tenants', href: '/tenants', isActive: true }]} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Tenant Management</h1>
            <p className='text-muted-foreground'>
              Manage organizations, monitor subscriptions, and handle access control.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button size='sm' onClick={() => toast.info('Tenant creation wizard coming soon')}>
              <Plus className='w-4 h-4 mr-2' />
              Create Tenant
            </Button>
          </div>
        </div>

        {/* Passing total directly to our mock stats calculator */}
        <TenantStatsCards />

        <TenantFilters onFilterChange={handleFilterChange} />

        <div className='space-y-4'>
          <TenantDataTable 
            data={data?.items || []} 
            isLoading={isLoading} 
            onSuspend={(t) => setTenantToSuspend(t)}
            onActivate={handleActivate}
            onExtend={handleExtend}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.total > 0 && (
            <div className='flex items-center justify-between py-2 px-1'>
               <div className='text-xs text-muted-foreground'>
                  Showing <span className='text-foreground font-medium'>{(currentPage - 1) * (filters.limit || 10) + 1}</span> to <span className='text-foreground font-medium'>{Math.min(currentPage * (filters.limit || 10), data.meta.total)}</span> of <span className='text-foreground font-medium'>{data.meta.total.toLocaleString()}</span> tenants
              </div>
              
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='icon' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading} className='w-8 h-8'>
                  <ChevronLeft className='w-4 h-4' />
                </Button>
                <div className='flex items-center gap-1 mx-2'>
                  <span className='text-sm text-foreground'>{currentPage}</span>
                </div>
                <Button variant='outline' size='icon' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} className='w-8 h-8'>
                  <ChevronRight className='w-4 h-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Main>

      <SuspendTenantDialog 
        tenant={tenantToSuspend} 
        open={!!tenantToSuspend} 
        onOpenChange={(v) => !v && setTenantToSuspend(null)} 
      />

      <ExtendTrialDialog
        tenant={tenantToExtend}
        open={!!tenantToExtend}
        onOpenChange={(v) => !v && setTenantToExtend(null)}
      />
    </>
  )
}
