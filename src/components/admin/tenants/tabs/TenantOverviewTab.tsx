import { Tenant } from '@/api/tenants.api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface TenantOverviewTabProps {
  tenant: Tenant
}

export function TenantOverviewTab({ tenant }: TenantOverviewTabProps) {
  return (
    <div className='grid gap-6 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
          <CardDescription>Core identity and attributes</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-4'>
            <div className='space-y-1.5'>
              <Label>Organization Name</Label>
              <Input readOnly value={tenant.name} />
            </div>
            <div className='space-y-1.5'>
              <Label>Internal Slug URL</Label>
              <Input readOnly value={tenant.slug} />
            </div>
            <div className='space-y-1.5'>
              <Label>Primary Contact Email</Label>
              <Input readOnly value={tenant.contactEmail || 'N/A'} />
            </div>
            <div className='flex gap-6 mt-2'>
              <div className='space-y-1.5'>
                <Label>Created At</Label>
                <div className='text-sm text-muted-foreground'>
                  {format(new Date(tenant.createdAt), 'PPpp')}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage & Status</CardTitle>
          <CardDescription>Plan level and lifecycle metrics</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex justify-between items-center py-2 border-b'>
            <Label>Current Plan</Label>
            <Badge variant='outline' className='uppercase'>{tenant.plan}</Badge>
          </div>
          <div className='flex justify-between items-center py-2 border-b'>
            <Label>Status</Label>
            <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'} className='uppercase'>
              {tenant.status}
            </Badge>
          </div>
          <div className='flex justify-between items-center py-2 border-b'>
            <Label>Registered Members</Label>
            <div className='font-medium'>{tenant.userCount} Members</div>
          </div>
          {tenant.status === 'trial' && tenant.trialEndsAt && (
            <div className='flex justify-between items-center py-2 border-b'>
              <Label>Trial Expiration</Label>
              <div className='font-medium text-blue-600'>
                {format(new Date(tenant.trialEndsAt), 'MMM dd, yyyy')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
