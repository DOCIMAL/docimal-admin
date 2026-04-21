import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, PauseCircle, ShieldAlert, Trash2, PlayCircle } from 'lucide-react'

import { useTenant, useActivateTenant } from '@/api/tenants.api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

import { TenantOverviewTab } from '@/components/admin/tenants/tabs/TenantOverviewTab'
import { TenantMembersTab } from '@/components/admin/tenants/tabs/TenantMembersTab'
import { TenantWorkspacesTab } from '@/components/admin/tenants/tabs/TenantWorkspacesTab'
import { TenantSubscriptionTab } from '@/components/admin/tenants/tabs/TenantSubscriptionTab'
import { TenantSettingsTab } from '@/components/admin/tenants/tabs/TenantSettingsTab'
import { TenantBillingTab } from '@/features/billing/components/tenant-billing-tab'
import { SuspendTenantDialog } from '@/components/admin/tenants/dialogs/SuspendTenantDialog'
import { DeleteTenantDialog } from '@/components/admin/tenants/dialogs/DeleteTenantDialog'
import { ExtendTrialDialog } from '@/components/admin/tenants/dialogs/ExtendTrialDialog'

export const Route = createFileRoute('/_authenticated/tenants/$tenantId')({
  component: TenantDetailPage,
})

function TenantDetailPage() {
  const { tenantId } = Route.useParams()
  const navigate = useNavigate()

  const { data: tenant, isLoading } = useTenant(tenantId)
  const { mutate: activateTenant } = useActivateTenant()

  const [suspendOpen, setSuspendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [extendTrialOpen, setExtendTrialOpen] = useState(false)

  if (isLoading) {
    return (
      <Main>
        <div className="flex h-64 items-center justify-center">Loading tenant details...</div>
      </Main>
    )
  }

  if (!tenant) {
    return (
      <Main>
        <div className="flex flex-col items-center justify-center space-y-4 pt-12">
          <div className="text-xl font-medium">Tenant not found</div>
          <Button onClick={() => navigate({ to: '/tenants' })}>Go back to list</Button>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header>
        <TopNav links={[
          { title: 'Tenants', href: '/tenants', isActive: false },
          { title: tenant.name, href: `/tenants/${tenant.id}`, isActive: true }
        ]} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="max-w-5xl">
        <div className='mb-6'>
          <Link to="/tenants" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 w-fit">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Tenants
          </Link>
          
          <div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
            <div>
              <div className="flex items-center gap-3">
                <h1 className='text-3xl font-bold tracking-tight'>{tenant.name}</h1>
                <Badge variant={tenant.status === 'active' ? 'default' : tenant.status === 'suspended' ? 'destructive' : 'secondary'} className="uppercase">
                  {tenant.status}
                </Badge>
                <Badge variant="outline" className="uppercase">{tenant.plan}</Badge>
              </div>
              <p className='text-muted-foreground mt-1'>
                Manage organization details, members, and resources.
              </p>
            </div>
            
            <div className='flex items-center gap-2'>
              {tenant.status === 'suspended' ? (
                <Button 
                  variant='outline' 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => activateTenant(tenant.id)}
                >
                  <ShieldAlert className='w-4 h-4 mr-2' />
                  Activate
                </Button>
              ) : (
                <Button 
                  variant='outline' 
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  onClick={() => setSuspendOpen(true)}
                >
                  <PauseCircle className='w-4 h-4 mr-2' />
                  Suspend
                </Button>
              )}
              
              {['trial', 'active'].includes(tenant.status) && (
                <Button 
                  variant='outline' 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => setExtendTrialOpen(true)}
                >
                  <PlayCircle className='w-4 h-4 mr-2' />
                  Extend Trial
                </Button>
              )}
              
              <Button 
                variant='destructive' 
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 bg-transparent border-b rounded-none w-full justify-start h-auto p-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
              Members
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
              Workspaces
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
              Billing
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
              Subscription
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0 outline-none">
            <TenantOverviewTab tenant={tenant} />
          </TabsContent>
          <TabsContent value="members" className="mt-0 outline-none">
            <TenantMembersTab />
          </TabsContent>
          <TabsContent value="workspaces" className="mt-0 outline-none">
            <TenantWorkspacesTab />
          </TabsContent>
          <TabsContent value="billing" className="mt-0 outline-none">
            <TenantBillingTab tenantId={tenantId} tenant={tenant} />
          </TabsContent>
          <TabsContent value="subscription" className="mt-0 outline-none">
            <TenantSubscriptionTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 outline-none">
            <TenantSettingsTab tenant={tenant} />
          </TabsContent>
        </Tabs>
      </Main>

      <SuspendTenantDialog 
        tenant={tenant} 
        open={suspendOpen} 
        onOpenChange={setSuspendOpen} 
      />
      
      <DeleteTenantDialog 
        tenant={tenant} 
        open={deleteOpen} 
        onOpenChange={setDeleteOpen} 
      />

      <ExtendTrialDialog
        tenant={tenant}
        open={extendTrialOpen}
        onOpenChange={setExtendTrialOpen}
      />
    </>
  )
}
