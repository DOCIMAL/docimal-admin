import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { PaginatedResponse, MessageResponse, ListParams } from './common.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'
export type UserRole = 'super_admin' | 'tenant_owner' | 'tenant_admin' | 'user'

export interface AdminUser {
  id: string
  firstName: string
  lastName?: string
  email: string
  avatar?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  tenantId: string
  tenantName?: string
  tenantSlug?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateUserBody {
  firstName?: string
  lastName?: string
  status?: UserStatus
  role?: UserRole
}

export interface ListUsersParams extends ListParams {
  status?: UserStatus
  role?: UserRole
  tenantId?: string
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const BASE = '/admin/users'

export const usersApi = {
  list: (params?: ListUsersParams) =>
    apiClient.get<PaginatedResponse<AdminUser>>(BASE, { params }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<AdminUser>(`${BASE}/${id}`).then((r) => r.data),

  update: (id: string, body: UpdateUserBody) =>
    apiClient.patch<AdminUser>(`${BASE}/${id}`, body).then((r) => r.data),

  suspend: (id: string) =>
    apiClient.post<MessageResponse>(`${BASE}/${id}/suspend`).then((r) => r.data),

  activate: (id: string) =>
    apiClient.post<MessageResponse>(`${BASE}/${id}/activate`).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<MessageResponse>(`${BASE}/${id}`).then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateUserBody) => usersApi.update(id, body),
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      qc.setQueryData(userKeys.detail(id), user)
      toast.success('User updated')
    },
  })
}

export function useSuspendUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.suspend(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      qc.invalidateQueries({ queryKey: userKeys.detail(id) })
      toast.success('User suspended')
    },
  })
}

export function useActivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      qc.invalidateQueries({ queryKey: userKeys.detail(id) })
      toast.success('User activated')
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.lists() })
      toast.success('User deleted')
    },
  })
}
