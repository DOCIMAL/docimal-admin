import { TenantDetail } from '@/api/tenants.api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format, differenceInDays } from 'date-fns'
import { Progress } from '@/components/ui/progress'
import { User, Wallet, Boxes, Bot } from 'lucide-react'


interface TenantOverviewTabProps {
  tenant: TenantDetail
}

export function TenantOverviewTab({ tenant }: TenantOverviewTabProps) {
  const trialDaysTotal = 14
  const daysLeft = tenant.trialEndsAt 
    ? differenceInDays(new Date(tenant.trialEndsAt), new Date()) 
    : 0
  const progress = tenant.trialEndsAt 
    ? Math.max(0, Math.min(100, (daysLeft / trialDaysTotal) * 100))
    : 0

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

            {tenant.owner && (
              <div className='mt-4 pt-4 border-t space-y-3'>
                <Label className="text-xs font-bold uppercase text-muted-foreground">Tenant Owner</Label>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors'>
                    <User className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <div className='font-medium'>{tenant.owner.name}</div>
                    <div className='text-xs text-muted-foreground'>{tenant.owner.email}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
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
            
            {tenant.status === 'trial' && tenant.trialEndsAt && (
              <div className='space-y-3 py-2'>
                <div className='flex justify-between items-center'>
                  <Label>Trial Progression</Label>
                  <div className='text-sm font-medium text-orange-600'>
                    {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expiring today'}
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] text-muted-foreground">
                  Trial ends on {format(new Date(tenant.trialEndsAt), 'PPP')}
                </p>
              </div>
            )}

            {tenant.status === 'suspended' && tenant.suspensionReason && (
              <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>
                <div className="font-bold mb-1">Suspension Reason:</div>
                {tenant.suspensionReason}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Workspaces</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{tenant.workspaceCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Chatbots</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{tenant.chatbotCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">API Calls</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{tenant.apiCallsMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <div className="mt-2 text-2xl font-bold">{(tenant.storageUsage / 1024 / 1024).toFixed(1)} MB</div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}
