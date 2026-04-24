import { useState } from 'react'
import { Download, History, RotateCcw } from 'lucide-react'
import { useAdminSubscriptions, useAdminInvoices, useResetTenantQuota, useTenantQuotaUsage } from '@/api/billing.api'
import type { Tenant } from '@/api/tenants.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExtendTrialDialog } from './extend-trial-dialog'
import { OverridePlanDialog } from './override-plan-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Local formatters
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatStorage(bytes: number): string {
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function toProgress(used: number, limit: number): number {
  if (limit < 0) {
    return 100
  }

  if (limit === 0) {
    return 0
  }

  return Math.min((used / limit) * 100, 100)
}

function formatQuotaLimit(limit: number): string {
  return limit < 0 ? 'Unlimited' : String(limit)
}

// Reuse standard labels from your column definitions if needed
const planColors: Record<string, string> = {
  free: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  professional:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  enterprise:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
}

const statusColors: Record<string, string> = {
  active:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  trialing: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  canceled: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  past_due:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
}

interface TenantBillingTabProps {
  tenantId: string
  tenant: Tenant
}

export function TenantBillingTab({ tenantId, tenant }: TenantBillingTabProps) {
  const [showOverridePlan, setShowOverridePlan] = useState(false)
  const [showExtendTrial, setShowExtendTrial] = useState(false)
  const [showResetQuota, setShowResetQuota] = useState(false)

  const { data: subData, isLoading: isLoadingSub } = useAdminSubscriptions({
    tenantId,
    limit: 1,
  })

  const { data: invData, isLoading: isLoadingInv } = useAdminInvoices({
    tenantId,
    limit: 5,
  })
  const { data: quotaUsage, isLoading: isLoadingQuota } = useTenantQuotaUsage(tenantId)

  const resetTenantQuota = useResetTenantQuota()

  const handleResetQuota = () => {
    resetTenantQuota.mutate(tenantId, {
      onSuccess: () => {
        setShowResetQuota(false)
      },
    })
  }

  const currentSub = subData?.items?.[0]
  const invoices = invData?.items || []

  const isTrial = currentSub?.status === 'trialing'

  const quotas = quotaUsage?.quotas

  // Dummy Plan History
  const planHistory = [
    { date: '2025-12-10T10:00:00Z', event: 'Registered Free Plan' },
    { date: '2026-01-15T14:30:00Z', event: 'Upgraded to Starter' },
    { date: '2026-03-01T09:15:00Z', event: 'Upgraded to Professional' },
  ]

  return (
    <div className='flex flex-col gap-4 lg:grid lg:grid-cols-2'>
      {/* 1. Subscription Info */}
      <Card className='col-span-1'>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            Overview of the tenant's active plan
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {isLoadingSub ? (
            <div className='space-y-4'>
              <Skeleton className='h-4 w-1/2' />
              <Skeleton className='h-4 w-1/3' />
            </div>
          ) : currentSub ? (
            <>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <div className='text-sm font-medium text-muted-foreground'>
                    Plan
                  </div>
                  <Badge
                    className={
                      planColors[currentSub.plan] ||
                      'bg-slate-100 text-slate-800'
                    }
                  >
                    {currentSub.plan.charAt(0).toUpperCase() +
                      currentSub.plan.slice(1)}
                  </Badge>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm font-medium text-muted-foreground'>
                    Status
                  </div>
                  <Badge className={statusColors[currentSub.status] || ''}>
                    {currentSub.status === 'past_due'
                      ? 'Past Due'
                      : currentSub.status}
                  </Badge>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm font-medium text-muted-foreground'>
                    Amount
                  </div>
                  <div className='font-medium'>
                    {formatCurrency(currentSub.amount, currentSub.currency)} /{' '}
                    {currentSub.interval || 'month'}
                  </div>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm font-medium text-muted-foreground'>
                    Billing Period
                  </div>
                  <div className='text-sm'>
                    {formatDate(currentSub.currentPeriodStart)} -{' '}
                    {formatDate(currentSub.currentPeriodEnd)}
                  </div>
                </div>
                {isTrial && currentSub.trialEndsAt && (
                  <div className='col-span-2 space-y-1'>
                    <div className='text-sm font-medium text-muted-foreground'>
                      Trial Ends
                    </div>
                    <div className='text-sm font-medium text-amber-600'>
                      {formatDate(currentSub.trialEndsAt)}
                    </div>
                  </div>
                )}
              </div>

              <div className='flex items-center gap-3 border-t pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowOverridePlan(true)}
                >
                  Override Plan
                </Button>
                {isTrial && (
                  <Button
                    variant='outline'
                    onClick={() => setShowExtendTrial(true)}
                  >
                    Extend Trial
                  </Button>
                )}
                <AlertDialog open={showResetQuota} onOpenChange={setShowResetQuota}>
                  <AlertDialogTrigger asChild>
                    <Button variant='outline' className='gap-2'>
                      <RotateCcw className='h-4 w-4' />
                      Reset Quota
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Tenant Quota?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset the quota settings for {tenant.name} to
                        the current PLAN_QUOTAS defaults. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={resetTenantQuota.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetQuota}
                        disabled={resetTenantQuota.isPending}
                        className='gap-2'
                      >
                        {resetTenantQuota.isPending && (
                          <span className='h-4 w-4 animate-spin'>↻</span>
                        )}
                        Reset Quota
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {showOverridePlan && (
                <OverridePlanDialog
                  open={showOverridePlan}
                  onOpenChange={setShowOverridePlan}
                  tenantId={tenantId}
                  tenantName={tenant.name}
                  currentPlan={
                    currentSub.plan as
                      | 'free'
                      | 'starter'
                      | 'professional'
                      | 'enterprise'
                  }
                />
              )}
              {showExtendTrial && (
                <ExtendTrialDialog
                  open={showExtendTrial}
                  onOpenChange={setShowExtendTrial}
                  tenantId={tenantId}
                  tenantName={tenant.name}
                  currentPeriodEnd={currentSub.currentPeriodEnd}
                  status={
                    currentSub.status as
                      | 'active'
                      | 'trialing'
                      | 'canceled'
                      | 'past_due'
                  }
                />
              )}
            </>
          ) : (
            <div className='text-sm text-muted-foreground'>
              No active subscription
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Quota Usage */}
      <Card className='col-span-1'>
        <CardHeader>
          <CardTitle>Quota Usage</CardTitle>
          <CardDescription>
            Tenant's resource limits and utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingQuota ? (
            <div className='space-y-4'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          ) : !quotas ? (
            <div className='text-sm text-muted-foreground'>
              Failed to load tenant quota usage.
            </div>
          ) : (
            <div className='space-y-6'>
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium'>Workspaces</span>
                <span className='text-muted-foreground'>
                  {quotas.workspaces.used} / {formatQuotaLimit(quotas.workspaces.limit)}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full bg-primary'
                  style={{
                    width: `${toProgress(quotas.workspaces.used, quotas.workspaces.limit)}%`,
                  }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium'>Members</span>
                <span className='text-muted-foreground'>
                  {quotas.members.used} / {formatQuotaLimit(quotas.members.limit)}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full bg-blue-500'
                  style={{
                    width: `${toProgress(quotas.members.used, quotas.members.limit)}%`,
                  }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium'>Documents</span>
                <span className='text-muted-foreground'>
                  {quotas.documents.used} / {formatQuotaLimit(quotas.documents.limit)}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full bg-purple-500'
                  style={{
                    width: `${toProgress(quotas.documents.used, quotas.documents.limit)}%`,
                  }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium'>Storage</span>
                <span className='text-muted-foreground'>
                  {formatStorage(quotas.storage.usedBytes)} / {quotas.storage.limitBytes < 0 ? 'Unlimited' : formatStorage(quotas.storage.limitBytes)}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full bg-amber-500'
                  style={{
                    width: `${toProgress(quotas.storage.usedBytes, quotas.storage.limitBytes)}%`,
                  }}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-medium'>Messages (This Month)</span>
                <span className='text-muted-foreground'>
                  {quotas.messages.used} / {formatQuotaLimit(quotas.messages.limit)}
                </span>
              </div>
              <div className='h-2 overflow-hidden rounded-full bg-secondary'>
                <div
                  className='h-full bg-emerald-500'
                  style={{
                    width: `${toProgress(quotas.messages.used, quotas.messages.limit)}%`,
                  }}
                />
              </div>
            </div>
          </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Invoices */}
      <Card className='col-span-1 lg:col-span-2'>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Past billing periods and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='w-[100px] text-right'>PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingInv ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    <Skeleton className='mx-auto h-4 w-32' />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='h-24 text-center text-muted-foreground'
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{formatDate(inv.createdAt)}</TableCell>
                    <TableCell className='font-medium'>
                      {formatCurrency(inv.amountPaid, inv.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'paid' ? 'default' : 'secondary'
                        }
                        className='capitalize'
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      {inv.invoicePdf ? (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title='Download PDF'
                          asChild
                        >
                          <a
                            href={inv.invoicePdf}
                            target='_blank'
                            rel='noreferrer'
                          >
                            <Download className='h-4 w-4' />
                          </a>
                        </Button>
                      ) : (
                        <span className='px-3 py-1'>-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 4. Plan Change History */}
      <Card className='col-span-1 lg:col-span-2'>
        <CardHeader>
          <CardTitle>Plan History</CardTitle>
          <CardDescription>
            Timeline of tenant subscription changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative ml-4 space-y-6 border-l border-muted-foreground/20 pb-2 pl-4'>
            {planHistory.map((item, idx) => (
              <div key={idx} className='relative'>
                <div className='absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground/30 bg-background'>
                  <History className='h-3 w-3 text-muted-foreground' />
                </div>
                <div className='space-y-1 pl-4'>
                  <p className='text-sm leading-none font-medium'>
                    {item.event}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
