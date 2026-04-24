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
      <Main className='flex items-center justify-center h-[50vh]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-muted-foreground font-medium'>Loading tenant details...</p>
        </div>
      </Main>
    )
  }

  if (!tenant) {
    return (
      <Main className='flex items-center justify-center h-[50vh]'>
        <div className='text-center'>
          <ShieldAlert className='h-12 w-12 text-destructive mx-auto mb-4' />
          <h2 className='text-2xl font-bold'>Tenant Not Found</h2>
          <p className='text-muted-foreground mt-2'>
            The requested tenant could not be found or is no longer accessible.
          </p>
          <Button variant='outline' className='mt-6' onClick={() => navigate({ to: '/tenants' })}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Tenants
          </Button>
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

      <Main>
        <div className='mb-6'>
          <Link to='/tenants' className='inline-flex items-center -ml-2 mb-4 h-8 rounded-md px-2 text-sm font-medium text-muted-foreground hover:text-foreground'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Tenants
          </Link>
          
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
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

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList className='bg-muted/50 p-1 border'>
            <TabsTrigger value='overview' className='data-[state=active]:bg-background'>
              Overview
            </TabsTrigger>
            <TabsTrigger value='members' className='data-[state=active]:bg-background'>
              Members
            </TabsTrigger>
            <TabsTrigger value='workspaces' className='data-[state=active]:bg-background'>
              Workspaces
            </TabsTrigger>
            <TabsTrigger value='billing' className='data-[state=active]:bg-background'>
              Billing
            </TabsTrigger>
            <TabsTrigger value='subscription' className='data-[state=active]:bg-background'>
              Subscription
            </TabsTrigger>
            <TabsTrigger value='settings' className='data-[state=active]:bg-background'>
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value='overview' className='outline-none'>
            <TenantOverviewTab tenant={tenant} />
          </TabsContent>
          <TabsContent value='members' className='outline-none'>
            <TenantMembersTab />
          </TabsContent>
          <TabsContent value='workspaces' className='outline-none'>
            <TenantWorkspacesTab />
          </TabsContent>
          <TabsContent value='billing' className='outline-none'>
            <TenantBillingTab tenantId={tenantId} tenant={tenant} />
          </TabsContent>
          <TabsContent value='subscription' className='outline-none'>
            <TenantSubscriptionTab />
          </TabsContent>
          <TabsContent value='settings' className='outline-none'>
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
