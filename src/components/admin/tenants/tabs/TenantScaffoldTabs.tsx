import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const TenantMembersTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Administration</CardTitle>
        <CardDescription>Manage user roles and statuses assigned to this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant='default'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Pending API Integration</AlertTitle>
          <AlertDescription>
            The backend does not currently support querying users explicitly scoped by tenant ID directly to Super Admin. 
            This table will be populated in a future release.
          </AlertDescription>
        </Alert>
        
        <div className='mt-8 flex justify-center text-muted-foreground text-sm border p-12 rounded-lg border-dashed'>
          Member Table Placeholder
        </div>
      </CardContent>
    </Card>
  )
}

export const TenantWorkspacesTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspaces</CardTitle>
        <CardDescription>Track workspaces operating within this tenant.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex justify-center text-muted-foreground text-sm border p-12 rounded-lg border-dashed'>
          Workspace tracking API endpoint placeholder
        </div>
      </CardContent>
    </Card>
  )
}

export const TenantSubscriptionTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
        <CardDescription>Manage invoices, payment methods, and historical quotas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex justify-center text-muted-foreground text-sm border p-12 rounded-lg border-dashed'>
          Billing integration placeholder
        </div>
      </CardContent>
    </Card>
  )
}

export const TenantSettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Settings</CardTitle>
        <CardDescription>Configure branding and feature flags limit explicitly tailored for this node.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex justify-center text-muted-foreground text-sm border p-12 rounded-lg border-dashed'>
          Tenant override settings placeholder
        </div>
      </CardContent>
    </Card>
  )
}
