import { createFileRoute } from '@tanstack/react-router'
import { useTenant } from '@/api/tenants.api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TenantBillingTab } from '@/features/billing/components/tenant-billing-tab'

export const Route = createFileRoute('/_authenticated/tenants/$tenantId')({
  component: TenantDetail,
})

function TenantDetail() {
  const { tenantId } = Route.useParams()
  const { data: tenant, isLoading } = useTenant(tenantId)

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

      <Main>
        {isLoading ? (
          <div className='p-8 text-center'>Loading tenant...</div>
        ) : !tenant ? (
          <div className='p-8 text-center'>Tenant not found</div>
        ) : (
          <>
            <div className='mb-6 flex flex-col space-y-4'>
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>
                  Tenant: {tenant.name}
                </h1>
                <p className='text-muted-foreground'>
                  Manage tenant details, settings, and billing.
                </p>
              </div>
            </div>

            <Tabs defaultValue='billing' className='space-y-4'>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='users'>Users</TabsTrigger>
                <TabsTrigger value='billing'>Billing</TabsTrigger>
                <TabsTrigger value='settings'>Settings</TabsTrigger>
              </TabsList>

              <TabsContent value='overview'>
                <div className='rounded-md border p-4'>
                  Overview placeholder (Coming soon)
                </div>
              </TabsContent>

              <TabsContent value='users'>
                <div className='rounded-md border p-4'>
                  Users placeholder (Coming soon)
                </div>
              </TabsContent>

              <TabsContent value='billing'>
                <TenantBillingTab tenantId={tenantId} tenant={tenant} />
              </TabsContent>

              <TabsContent value='settings'>
                <div className='rounded-md border p-4'>
                  Settings placeholder (Coming soon)
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </Main>
    </>
  )
}
