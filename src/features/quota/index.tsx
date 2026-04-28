import { useMemo, useState } from 'react'
import { Activity, Gift, RefreshCw, Save, SlidersHorizontal, Users } from 'lucide-react'
import {
  type PlanQuotaConfig,
  type QuotaSettings,
  type TenantPlan,
  type TenantQuotaItem,
  useCreateFreeGrant,
  usePlanQuotaConfigs,
  useQuotaOverview,
  useRevokeQuotaOverride,
  useTenantQuotaUsageList,
  useUpdatePlanQuota,
} from '@/api/quota.api'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

const planLabels: Record<TenantPlan, string> = {
  free: 'Free',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

const featureLabels: Array<[keyof QuotaSettings['features'], string]> = [
  ['apiAccess', 'API access'],
  ['customBranding', 'Custom branding'],
  ['webhooks', 'Webhooks'],
  ['whiteLabel', 'White label'],
  ['customIntegrations', 'Custom integrations'],
  ['advancedAnalytics', 'Advanced analytics'],
  ['exportData', 'Export data'],
]

function formatLimit(value: number) {
  return value < 0 ? 'Unlimited' : value.toLocaleString()
}

function formatBytes(bytes: number) {
  if (bytes < 0) return 'Unlimited'
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

function percent(used: number, limit: number) {
  if (limit < 0) return 100
  if (limit === 0) return 0
  return Math.min((used / limit) * 100, 100)
}

function toEditableQuota(config: PlanQuotaConfig): QuotaSettings {
  return {
    maxWorkspaces: config.maxWorkspaces,
    maxUsers: config.maxUsers,
    maxDocuments: config.maxDocuments,
    maxStorageBytes: config.maxStorageBytes,
    maxMessagesPerMonth: config.maxMessagesPerMonth,
    features: { ...config.features },
  }
}

function MetricCard({ title, value, hint, icon: Icon }: { title: string; value: string | number; hint: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-xs text-muted-foreground'>{hint}</p>
      </CardContent>
    </Card>
  )
}

function PlanQuotaEditor({ plan }: { plan: PlanQuotaConfig }) {
  const [draft, setDraft] = useState<QuotaSettings>(() => toEditableQuota(plan))
  const updatePlanQuota = useUpdatePlanQuota()

  const setNumber = (key: keyof Omit<QuotaSettings, 'features'>, value: string) => {
    setDraft((current) => ({ ...current, [key]: Number(value) }))
  }

  const setFeature = (key: keyof QuotaSettings['features'], value: boolean) => {
    setDraft((current) => ({ ...current, features: { ...current.features, [key]: value } }))
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{planLabels[plan.plan]}</CardTitle>
            <CardDescription>Version {plan.version}</CardDescription>
          </div>
          <Badge variant='outline'>{plan.plan}</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <QuotaNumber label='Workspaces' value={draft.maxWorkspaces} onChange={(v) => setNumber('maxWorkspaces', v)} />
          <QuotaNumber label='Members' value={draft.maxUsers} onChange={(v) => setNumber('maxUsers', v)} />
          <QuotaNumber label='Documents' value={draft.maxDocuments} onChange={(v) => setNumber('maxDocuments', v)} />
          <QuotaNumber label='Storage bytes' value={draft.maxStorageBytes} onChange={(v) => setNumber('maxStorageBytes', v)} />
          <QuotaNumber label='Messages/month' value={draft.maxMessagesPerMonth} onChange={(v) => setNumber('maxMessagesPerMonth', v)} />
        </div>
        <div className='grid gap-2 sm:grid-cols-2'>
          {featureLabels.map(([key, label]) => (
            <div key={key} className='flex items-center justify-between rounded-lg border px-3 py-2'>
              <Label className='text-xs'>{label}</Label>
              <Switch checked={Boolean(draft.features[key])} onCheckedChange={(value) => setFeature(key, value)} />
            </div>
          ))}
        </div>
        <Button
          className='w-full gap-2'
          disabled={updatePlanQuota.isPending}
          onClick={() => updatePlanQuota.mutate({ plan: plan.plan, quota: draft })}
        >
          <Save className='h-4 w-4' />
          {updatePlanQuota.isPending ? 'Saving...' : 'Save quota'}
        </Button>
      </CardContent>
    </Card>
  )
}

function QuotaNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <div className='space-y-1.5'>
      <Label className='text-xs'>{label}</Label>
      <Input type='number' value={value} onChange={(event) => onChange(event.target.value)} />
      <p className='text-[11px] text-muted-foreground'>Use -1 for unlimited</p>
    </div>
  )
}

function TenantUsageTable() {
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState<TenantPlan | 'all'>('all')
  const [selected, setSelected] = useState<TenantQuotaItem | null>(null)
  const { data, isLoading, refetch, isFetching } = useTenantQuotaUsageList({
    page: 1,
    limit: 25,
    search: search || undefined,
    plan: plan === 'all' ? undefined : plan,
  })
  const revokeOverride = useRevokeQuotaOverride()

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <CardTitle>Tenant Usage</CardTitle>
            <CardDescription>Live quota usage by tenant with free grant controls.</CardDescription>
          </div>
          <div className='flex gap-2'>
            <Input placeholder='Search tenant...' value={search} onChange={(e) => setSearch(e.target.value)} className='w-56' />
            <Select value={plan} onValueChange={(v) => setPlan(v as TenantPlan | 'all')}>
              <SelectTrigger className='w-40'><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All plans</SelectItem>
                <SelectItem value='free'>Free</SelectItem>
                <SelectItem value='starter'>Starter</SelectItem>
                <SelectItem value='professional'>Professional</SelectItem>
                <SelectItem value='enterprise'>Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='icon' onClick={() => refetch()}><RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Override</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, index) => <TableRow key={index}><TableCell colSpan={8}><Skeleton className='h-8 w-full' /></TableCell></TableRow>)
            ) : data?.data.length ? (
              data.data.map((tenant) => (
                <TableRow key={tenant.tenantId}>
                  <TableCell><div className='font-medium'>{tenant.tenantName}</div><div className='text-xs text-muted-foreground'>{tenant.tenantSlug}</div></TableCell>
                  <TableCell><Badge variant='outline'>{tenant.plan}</Badge></TableCell>
                  <QuotaCell used={tenant.usage.userCount} limit={tenant.limits.maxUsers} />
                  <QuotaCell used={tenant.usage.documentCount} limit={tenant.limits.maxDocuments} />
                  <TableCell>{formatBytes(tenant.usage.storageBytes)} / {formatBytes(tenant.limits.maxStorageBytes)}</TableCell>
                  <QuotaCell used={tenant.usage.messageCount} limit={tenant.limits.maxMessagesPerMonth} />
                  <TableCell>{tenant.override ? <Badge>Active</Badge> : <span className='text-xs text-muted-foreground'>None</span>}</TableCell>
                  <TableCell className='text-right'>
                    <Button size='sm' variant='outline' className='mr-2 gap-1' onClick={() => setSelected(tenant)}><Gift className='h-3 w-3' />Free grant</Button>
                    {tenant.override && <Button size='sm' variant='ghost' onClick={() => revokeOverride.mutate({ tenantId: tenant.tenantId, reason: 'Revoked from admin quota page' })}>Revoke</Button>}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={8} className='h-20 text-center text-muted-foreground'>No tenants found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {selected && <FreeGrantDialog tenant={selected} open={!!selected} onOpenChange={(open) => !open && setSelected(null)} />}
    </Card>
  )
}

function QuotaCell({ used, limit }: { used: number; limit: number }) {
  return <TableCell><div className='mb-1 text-xs'>{used.toLocaleString()} / {formatLimit(limit)}</div><Progress value={percent(used, limit)} /></TableCell>
}

function FreeGrantDialog({ tenant, open, onOpenChange }: { tenant: TenantQuotaItem; open: boolean; onOpenChange: (open: boolean) => void }) {
  const createFreeGrant = useCreateFreeGrant()
  const [days, setDays] = useState(14)
  const [reason, setReason] = useState('Temporary free plan expansion')
  const [quota, setQuota] = useState<QuotaSettings>(() => ({
    maxWorkspaces: 5,
    maxUsers: 20,
    maxDocuments: 1000,
    maxStorageBytes: 10 * 1024 * 1024 * 1024,
    maxMessagesPerMonth: 10000,
    features: { ...tenant.limits.features, apiAccess: true, customBranding: true, webhooks: true },
  }))

  const submit = () => {
    createFreeGrant.mutate({ tenantId: tenant.tenantId, body: { days, quota, reason } }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Free grant for {tenant.tenantName}</DialogTitle>
          <DialogDescription>Temporarily expand quota for a tenant on the Free plan. It auto-expires after the selected duration.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'><Label>Days</Label><Input type='number' min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} /></div>
          <div className='space-y-1.5'><Label>Messages/month</Label><Input type='number' value={quota.maxMessagesPerMonth} onChange={(e) => setQuota({ ...quota, maxMessagesPerMonth: Number(e.target.value) })} /></div>
          <div className='space-y-1.5'><Label>Workspaces</Label><Input type='number' value={quota.maxWorkspaces} onChange={(e) => setQuota({ ...quota, maxWorkspaces: Number(e.target.value) })} /></div>
          <div className='space-y-1.5'><Label>Members</Label><Input type='number' value={quota.maxUsers} onChange={(e) => setQuota({ ...quota, maxUsers: Number(e.target.value) })} /></div>
          <div className='space-y-1.5'><Label>Documents</Label><Input type='number' value={quota.maxDocuments} onChange={(e) => setQuota({ ...quota, maxDocuments: Number(e.target.value) })} /></div>
          <div className='space-y-1.5'><Label>Storage bytes</Label><Input type='number' value={quota.maxStorageBytes} onChange={(e) => setQuota({ ...quota, maxStorageBytes: Number(e.target.value) })} /></div>
          <div className='space-y-1.5 sm:col-span-2'><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={createFreeGrant.isPending}>{createFreeGrant.isPending ? 'Applying...' : 'Apply free grant'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QuotaManagement() {
  const { data: overview, isLoading: overviewLoading } = useQuotaOverview()
  const { data: planQuotas, isLoading: plansLoading } = usePlanQuotaConfigs()
  const totalFree = overview?.planCounts.free ?? 0
  const paidTenants = useMemo(() => overview ? overview.totalTenants - totalFree : 0, [overview, totalFree])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'><ThemeSwitch /><ConfigDrawer /><ProfileDropdown /></div>
      </Header>
      <Main className='flex flex-1 flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quota Management</h2>
          <p className='text-muted-foreground'>Manage plan quota defaults, tenant usage, and temporary free grants.</p>
        </div>
        <div className='grid gap-4 md:grid-cols-4'>
          {overviewLoading ? [...Array(4)].map((_, i) => <Skeleton key={i} className='h-28' />) : (
            <>
              <MetricCard title='Total tenants' value={overview?.totalTenants ?? 0} hint='Across all plans' icon={Users} />
              <MetricCard title='Free tenants' value={totalFree} hint='Eligible for free grants' icon={Gift} />
              <MetricCard title='Paid tenants' value={paidTenants} hint='Starter and above' icon={Activity} />
              <MetricCard title='Active overrides' value={overview?.activeOverrides ?? 0} hint='Temporary quota rules' icon={SlidersHorizontal} />
            </>
          )}
        </div>
        <Tabs defaultValue='plans' className='space-y-4'>
          <TabsList><TabsTrigger value='plans'>Plan quotas</TabsTrigger><TabsTrigger value='tenants'>Tenant usage</TabsTrigger></TabsList>
          <TabsContent value='plans'>
            {plansLoading ? <div className='grid gap-4 md:grid-cols-2'>{[...Array(4)].map((_, i) => <Skeleton key={i} className='h-96' />)}</div> : <div className='grid gap-4 md:grid-cols-2'>{planQuotas?.map((plan) => <PlanQuotaEditor key={plan.plan} plan={plan} />)}</div>}
          </TabsContent>
          <TabsContent value='tenants'><TenantUsageTable /></TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
