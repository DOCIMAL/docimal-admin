import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type {
  PaginatedResponse,
  MessageResponse,
  ListParams,
} from './common.types'
import { tenantKeys } from './tenants.api'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due'
export type SubscriptionPlan =
  | 'free'
  | 'starter'
  | 'professional'
  | 'enterprise'
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible'

export interface BillingOverview {
  mrr: number
  arr: number
  totalRevenue: number
  revenueThisMonth: number
  revenueLastMonth: number
  revenueGrowthPercent: number
  paidTenants: number
  trialingTenants: number
  churnRate: number
  conversionRate: number
  arpu: number
}

export interface AdminSubscription {
  id: string
  tenantId: string
  tenantName: string
  tenantSlug: string
  plan: SubscriptionPlan
  planName?: string
  status: SubscriptionStatus
  amount: number
  currency: string
  interval?: 'month' | 'year'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
  trialEndsAt?: string
  createdAt: string
  updatedAt?: string
}

export interface AdminInvoice {
  id: string
  tenantId: string
  tenantName: string
  stripeInvoiceId: string
  amountPaid: number
  currency: string
  status: InvoiceStatus
  periodStart?: string
  periodEnd?: string
  dueDate?: string
  paidAt?: string
  invoicePdf?: string
  createdAt: string
}

export interface AdminPlan {
  id: string
  name: string
  description?: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  trialDays?: number
  features?: string[]
  activeSubscriptions: number
  createdAt: string
}

export interface PlanDistribution {
  planId: string
  planName: string
  amount: number
  currency: string
  interval: string
  tenantCount: number
  percentage: number
  monthlyRecurringRevenue: number
}

export interface RevenueChartData {
  month: string // YYYY-MM format
  revenue: number
  newSubscriptions: number
  cancelations: number
}

export interface SubscriptionStats {
  active: number
  trialing: number
  canceled: number
  pastDue: number
}

export interface InvoiceSummary {
  totalPaidThisMonth: number
  totalPaidLastMonth: number
  totalOutstanding: number
}

export interface ListSubscriptionsParams extends ListParams {
  status?: SubscriptionStatus | SubscriptionStatus[]
  plan?: SubscriptionPlan | SubscriptionPlan[]
  tenantId?: string
}

export interface ListInvoicesParams extends ListParams {
  status?: InvoiceStatus | InvoiceStatus[]
  startDate?: string
  endDate?: string
  tenantId?: string
}

export interface ExtendTrialBody {
  days: number
}

export interface OverridePlanBody {
  plan: SubscriptionPlan
}

export interface ResetQuotaBody {
  confirm: boolean
}

export interface ResetQuotaResponse {
  success: boolean
  message: string
  tenantId?: string
  plan?: string
  settings?: {
    maxUsers: number
    maxWorkspaces: number
    maxDocuments: number
    maxStorageBytes: number
    maxMessagesPerMonth: number
    features: Record<string, boolean>
  }
  totalTenants?: number
  successCount?: number
  failedCount?: number
  results?: Array<{
    tenantId: string
    plan: string
    oldMaxUsers?: number
    newMaxUsers: number
    success: boolean
  }>
}

export interface TenantQuotaUsage {
  tenantId: string
  quotas: {
    workspaces: { used: number; limit: number }
    members: { used: number; limit: number }
    documents: { used: number; limit: number }
    storage: { usedBytes: number; limitBytes: number }
    messages: { used: number; limit: number }
  }
  features: Record<string, boolean>
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const BASE = '/admin/billing'

export const billingApi = {
  getOverview: () =>
    apiClient
      .get<{ data: BillingOverview }>(`${BASE}/overview`)
      .then((r) => r.data.data),

  listSubscriptions: (params?: ListSubscriptionsParams) =>
    apiClient
      .get<{ data: AdminSubscription[]; meta: PaginatedResponse<AdminSubscription>['meta'] }>(`${BASE}/subscriptions`, {
        params,
      })
      .then((r) => ({ items: r.data.data, meta: r.data.meta })),

  listInvoices: (params?: ListInvoicesParams) =>
    apiClient
      .get<{ data: AdminInvoice[]; meta: PaginatedResponse<AdminInvoice>['meta']; summary: InvoiceSummary }>(`${BASE}/invoices`, { params })
      .then((r) => ({ items: r.data.data, meta: r.data.meta, summary: r.data.summary })),

  listPlans: () =>
    apiClient
      .get<{ data: AdminPlan[] }>(`${BASE}/plans`)
      .then((r) => r.data.data),

  getPlanDistribution: () =>
    apiClient
      .get<{ data: PlanDistribution[] }>(`${BASE}/plan-distribution`)
      .then((r) => r.data.data),

  getRevenueChart: (months?: number) =>
    apiClient
      .get<{
        data: RevenueChartData[]
        meta: { months: number; startDate: string; endDate: string }
      }>(`${BASE}/revenue-chart`, { params: { months } })
      .then((r) => r.data),

  syncPlans: () =>
    apiClient
      .post<MessageResponse>(`${BASE}/plans/sync`, {})
      .then((r) => r.data),

  extendTrial: (tenantId: string, days: number) =>
    apiClient
      .post<MessageResponse>(`${BASE}/tenants/${tenantId}/extend-trial`, {
        days,
      })
      .then((r) => r.data),

  overridePlan: (tenantId: string, plan: SubscriptionPlan) =>
    apiClient
      .post<MessageResponse>(`${BASE}/tenants/${tenantId}/override-plan`, {
        plan,
      })
      .then((r) => r.data),

  resetTenantQuota: (tenantId: string) =>
    apiClient
      .post<ResetQuotaResponse>(`${BASE}/tenants/${tenantId}/reset-quota`)
      .then((r) => r.data),

  resetAllQuotas: () =>
    apiClient
      .post<ResetQuotaResponse>(`${BASE}/tenants/reset-all-quotas`, {
        confirm: true,
      })
      .then((r) => r.data),

  getTenantQuotaUsage: (tenantId: string) =>
    apiClient
      .get<TenantQuotaUsage>(`${BASE}/tenants/${tenantId}/quota-usage`)
      .then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const billingKeys = {
  all: ['billing'] as const,
  overview: () => [...billingKeys.all, 'overview'] as const,
  subscriptions: () => [...billingKeys.all, 'subscriptions'] as const,
  subscriptionLists: () => [...billingKeys.subscriptions(), 'list'] as const,
  subscriptionList: (params?: ListSubscriptionsParams) =>
    [...billingKeys.subscriptionLists(), params] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoiceLists: () => [...billingKeys.invoices(), 'list'] as const,
  invoiceList: (params?: ListInvoicesParams) =>
    [...billingKeys.invoiceLists(), params] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  planDistribution: () => [...billingKeys.all, 'plan-distribution'] as const,
  revenueChart: () => [...billingKeys.all, 'revenue-chart'] as const,
  revenueChartByMonths: (months?: number) =>
    [...billingKeys.revenueChart(), months] as const,
  tenantQuotaUsage: (tenantId: string) =>
    [...billingKeys.all, 'tenant-quota-usage', tenantId] as const,
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBillingOverview() {
  return useQuery({
    queryKey: billingKeys.overview(),
    queryFn: () => billingApi.getOverview(),
  })
}

export function useAdminSubscriptions(params?: ListSubscriptionsParams) {
  return useQuery({
    queryKey: billingKeys.subscriptionList(params),
    queryFn: () => billingApi.listSubscriptions(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminInvoices(params?: ListInvoicesParams) {
  return useQuery({
    queryKey: billingKeys.invoiceList(params),
    queryFn: () => billingApi.listInvoices(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: billingKeys.plans(),
    queryFn: () => billingApi.listPlans(),
  })
}

export function usePlanDistribution() {
  return useQuery({
    queryKey: billingKeys.planDistribution(),
    queryFn: () => billingApi.getPlanDistribution(),
  })
}

export function useRevenueChart(months?: number) {
  return useQuery({
    queryKey: billingKeys.revenueChartByMonths(months),
    queryFn: () => billingApi.getRevenueChart(months),
  })
}

export function useTenantQuotaUsage(tenantId: string) {
  return useQuery({
    queryKey: billingKeys.tenantQuotaUsage(tenantId),
    queryFn: () => billingApi.getTenantQuotaUsage(tenantId),
    enabled: !!tenantId,
  })
}

export function useSyncPlans() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => billingApi.syncPlans(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.plans() })
      toast.success('Plans synced successfully')
    },
    onError: () => {
      toast.error('Failed to sync plans')
    },
  })
}

export function useExtendTrial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tenantId, days }: { tenantId: string; days: number }) =>
      billingApi.extendTrial(tenantId, days),
    onSuccess: (_, { tenantId }) => {
      qc.invalidateQueries({ queryKey: billingKeys.subscriptionLists() })
      qc.invalidateQueries({ queryKey: tenantKeys.detail(tenantId) })
      toast.success('Trial extended successfully')
    },
    onError: () => {
      toast.error('Failed to extend trial')
    },
  })
}

export function useOverridePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      tenantId,
      plan,
    }: {
      tenantId: string
      plan: SubscriptionPlan
    }) => billingApi.overridePlan(tenantId, plan),
    onSuccess: (_, { tenantId }) => {
      qc.invalidateQueries({ queryKey: billingKeys.subscriptionLists() })
      qc.invalidateQueries({ queryKey: tenantKeys.detail(tenantId) })
      toast.success('Plan overridden successfully')
    },
    onError: () => {
      toast.error('Failed to override plan')
    },
  })
}

export function useResetTenantQuota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tenantId: string) =>
      billingApi.resetTenantQuota(tenantId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: billingKeys.all })
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Failed to reset tenant quota')
    },
  })
}

export function useResetAllQuotas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => billingApi.resetAllQuotas(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: billingKeys.all })
      toast.success(data.message)
    },
    onError: () => {
      toast.error('Failed to reset all quotas')
    },
  })
}
