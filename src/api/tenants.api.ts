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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TenantStatus = 'active' | 'expired' | 'suspended' | 'trial'
export type TenantPlan = 'free' | 'starter' | 'pro' | 'enterprise'

export interface Tenant {
  id: string
  name: string
  slug: string
  status: TenantStatus
  plan: TenantPlan
  contactEmail?: string
  logoUrl?: string
  userCount: number
  trialEndsAt?: string
  subscriptionEndsAt?: string
  createdAt: string
  updatedAt: string
}

export interface TenantStats {
  total: number
  statuses: {
    active: number
    trial: number
    suspended: number
    expired: number
  }
  plans: {
    free: number
    starter: number
    professional: number
    enterprise: number
  }
}

export interface TenantMember {
  id: string
  email: string
  name: string
  role: string
  status: string
  joinedAt: string
}

export interface TenantWorkspace {
  id: string
  name: string
  description?: string
  status: string
  createdAt: string
  avatar?: string
}

export interface TenantSubscriptionInfo {
  subscription: any // Match backend DTO
  invoices: any[]
}

export interface CreateTenantBody {
  name: string
  slug: string
  plan?: TenantPlan
  contactEmail?: string
}

export interface UpdateTenantBody {
  name?: string
  status?: TenantStatus
  plan?: TenantPlan
  contactEmail?: string
}

export interface ListTenantsParams extends ListParams {
  status?: TenantStatus
  plan?: TenantPlan
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const BASE = '/admin/tenants'

export const tenantsApi = {
  getStats: () => apiClient.get<TenantStats>(`${BASE}/stats`).then((r) => r.data),

  list: (params?: ListTenantsParams) =>
    apiClient
      .get<PaginatedResponse<Tenant>>(BASE, { params })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Tenant>(`${BASE}/${id}`).then((r) => r.data),

  create: (body: CreateTenantBody) =>
    apiClient.post<Tenant>(BASE, body).then((r) => r.data),

  update: (id: string, body: UpdateTenantBody) =>
    apiClient.patch<Tenant>(`${BASE}/${id}`, body).then((r) => r.data),

  suspend: (id: string) =>
    apiClient
      .post<MessageResponse>(`${BASE}/${id}/suspend`)
      .then((r) => r.data),

  activate: (id: string) =>
    apiClient
      .post<MessageResponse>((`${BASE}/${id}/activate`))
      .then((r) => r.data),

  extendTrial: (id: string, days: number) =>
    apiClient
      .post<MessageResponse>(`${BASE}/${id}/extend-trial`, { days })
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<MessageResponse>(`${BASE}/${id}`).then((r) => r.data),

  getMembers: (id: string) =>
    apiClient.get<TenantMember[]>(`${BASE}/${id}/members`).then((r) => r.data),

  getWorkspaces: (id: string) =>
    apiClient.get<TenantWorkspace[]>(`${BASE}/${id}/workspaces`).then((r) => r.data),

  getSubscription: (id: string) =>
    apiClient.get<TenantSubscriptionInfo>(`${BASE}/${id}/subscription`).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params?: ListTenantsParams) =>
    [...tenantKeys.lists(), params] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
  stats: () => [...tenantKeys.all, 'stats'] as const,
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useTenantStats() {
  return useQuery({
    queryKey: tenantKeys.stats(),
    queryFn: () => tenantsApi.getStats(),
  })
}

export function useTenants(params?: ListTenantsParams) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTenantBody) => tenantsApi.create(body),
    onSuccess: (tenant) => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      toast.success(`Tenant "${tenant.name}" created`)
    },
  })
}

export function useUpdateTenant(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateTenantBody) => tenantsApi.update(id, body),
    onSuccess: (tenant) => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      qc.setQueryData(tenantKeys.detail(id), tenant)
      toast.success(`Tenant "${tenant.name}" updated`)
    },
  })
}

export function useSuspendTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantsApi.suspend(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      qc.invalidateQueries({ queryKey: tenantKeys.detail(id) })
      toast.success('Tenant suspended')
    },
  })
}

export function useActivateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantsApi.activate(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      qc.invalidateQueries({ queryKey: tenantKeys.detail(id) })
      toast.success('Tenant activated')
    },
  })
}

export function useExtendTrialTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) => tenantsApi.extendTrial(id, days),
    onSuccess: (_, { id, days }) => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      qc.invalidateQueries({ queryKey: tenantKeys.detail(id) })
      toast.success(`Tenant trial extended by ${days} days`)
    },
  })
}

export function useDeleteTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tenantsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tenantKeys.lists() })
      toast.success('Tenant deleted')
    },
  })
}

export function useTenantMembers(id: string) {
  return useQuery({
    queryKey: [...tenantKeys.detail(id), 'members'],
    queryFn: () => tenantsApi.getMembers(id),
    enabled: !!id,
  })
}

export function useTenantWorkspaces(id: string) {
  return useQuery({
    queryKey: [...tenantKeys.detail(id), 'workspaces'],
    queryFn: () => tenantsApi.getWorkspaces(id),
    enabled: !!id,
  })
}

export function useTenantSubscription(id: string) {
  return useQuery({
    queryKey: [...tenantKeys.detail(id), 'subscription'],
    queryFn: () => tenantsApi.getSubscription(id),
    enabled: !!id,
  })
}
