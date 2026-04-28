import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise'
export type QuotaType = 'workspace' | 'user' | 'document' | 'storage' | 'message'

export interface QuotaFeatures {
  apiAccess: boolean
  customBranding: boolean
  webhooks: boolean
  whiteLabel: boolean
  customIntegrations: boolean
  advancedAnalytics: boolean
  exportData: boolean
}

export interface QuotaSettings {
  maxWorkspaces: number
  maxUsers: number
  maxDocuments: number
  maxStorageBytes: number
  maxMessagesPerMonth: number
  features: QuotaFeatures
}

export interface PlanQuotaConfig extends QuotaSettings {
  id: string
  plan: TenantPlan
  isActive: boolean
  version: number
  updatedBy?: string
  updatedAt?: string
}

export interface QuotaOverview {
  totalTenants: number
  activeOverrides: number
  planCounts: Record<TenantPlan, number>
  planQuotas: PlanQuotaConfig[]
}

export interface TenantQuotaItem {
  tenantId: string
  tenantName: string
  tenantSlug: string
  plan: TenantPlan
  status: string
  override: null | {
    id: string
    status: string
    startsAt?: string
    expiresAt?: string
    reason?: string
  }
  usage: {
    workspaceCount: number
    userCount: number
    documentCount: number
    storageBytes: number
    messageCount: number
  }
  limits: QuotaSettings
  overQuota: Record<QuotaType, boolean>
}

export interface TenantQuotaListResponse {
  data: TenantQuotaItem[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface TenantQuotaListParams {
  page?: number
  limit?: number
  plan?: TenantPlan
  search?: string
  quotaType?: QuotaType
  overQuota?: boolean
}

export interface FreeGrantBody {
  days: number
  quota: QuotaSettings
  reason?: string
}

const BASE = '/admin/quota'

export const quotaApi = {
  getOverview: () => apiClient.get<QuotaOverview>(`${BASE}/overview`).then((r) => r.data),
  listPlanQuotas: () => apiClient.get<PlanQuotaConfig[]>(`${BASE}/plans`).then((r) => r.data),
  updatePlanQuota: (plan: TenantPlan, body: QuotaSettings) =>
    apiClient.patch(`${BASE}/plans/${plan}`, body).then((r) => r.data),
  listTenantQuotaUsage: (params?: TenantQuotaListParams) =>
    apiClient.get<TenantQuotaListResponse>(`${BASE}/tenants`, { params }).then((r) => r.data),
  createFreeGrant: (tenantId: string, body: FreeGrantBody) =>
    apiClient.post(`${BASE}/tenants/${tenantId}/free-grant`, body).then((r) => r.data),
  revokeOverride: (tenantId: string, reason?: string) =>
    apiClient.post(`${BASE}/tenants/${tenantId}/override/revoke`, { reason }).then((r) => r.data),
}

export const quotaKeys = {
  all: ['quota'] as const,
  overview: () => [...quotaKeys.all, 'overview'] as const,
  plans: () => [...quotaKeys.all, 'plans'] as const,
  tenants: () => [...quotaKeys.all, 'tenants'] as const,
  tenantList: (params?: TenantQuotaListParams) => [...quotaKeys.tenants(), params] as const,
}

export function useQuotaOverview() {
  return useQuery({ queryKey: quotaKeys.overview(), queryFn: quotaApi.getOverview })
}

export function usePlanQuotaConfigs() {
  return useQuery({ queryKey: quotaKeys.plans(), queryFn: quotaApi.listPlanQuotas })
}

export function useTenantQuotaUsageList(params?: TenantQuotaListParams) {
  return useQuery({
    queryKey: quotaKeys.tenantList(params),
    queryFn: () => quotaApi.listTenantQuotaUsage(params),
    placeholderData: keepPreviousData,
  })
}

export function useUpdatePlanQuota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ plan, quota }: { plan: TenantPlan; quota: QuotaSettings }) => quotaApi.updatePlanQuota(plan, quota),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotaKeys.all })
      toast.success('Plan quota updated')
    },
    onError: () => toast.error('Failed to update plan quota'),
  })
}

export function useCreateFreeGrant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tenantId, body }: { tenantId: string; body: FreeGrantBody }) => quotaApi.createFreeGrant(tenantId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotaKeys.all })
      toast.success('Free grant created')
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to create free grant'),
  })
}

export function useRevokeQuotaOverride() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tenantId, reason }: { tenantId: string; reason?: string }) => quotaApi.revokeOverride(tenantId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotaKeys.all })
      toast.success('Quota override revoked')
    },
    onError: () => toast.error('Failed to revoke quota override'),
  })
}
