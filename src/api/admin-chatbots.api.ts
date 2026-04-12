import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { agentClient } from '@/lib/api-client'
import type {
  PaginatedResponse,
  ListParams,
} from './common.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminChatbot {
  id: string
  workspaceId: string
  tenantId: string
  name: string
  avatarUrl?: string
  isPublished: boolean
  publishedVersion?: number
  draftVersion: number
  lastPublishedAt?: string
  defaultModel: string
  temperature: number
  createdAt: string
  updatedAt: string
}

export interface AdminChatbotStats {
  totalChatbots: number
  publishedChatbots: number
  draftChatbots: number
  totalConversations: number
  totalTokensUsed: number
}

export interface ChatbotUsagePoint {
  date: string
  conversations: number
  tokens: number
}

export interface AdminChatbotDetailStats {
  totalConversations: number
  totalTokens: number
  usageHistory: ChatbotUsagePoint[]
}

export interface ListAdminChatbotParams extends ListParams {
  tenantId?: string
  status?: 'Published' | 'Draft'
  model?: string
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const BASE = '/admin/chatbots'

export const adminChatbotsApi = {
  getStats: () => 
    agentClient.get<AdminChatbotStats>(`${BASE}/stats`).then((r) => r.data),

  list: (params?: ListAdminChatbotParams) =>
    agentClient
      .get<PaginatedResponse<AdminChatbot>>(BASE, { params })
      .then((r) => r.data),

  getById: (workspaceId: string) =>
    agentClient.get<AdminChatbot>(`${BASE}/${workspaceId}`).then((r) => r.data),

  getDetailStats: (workspaceId: string) =>
    agentClient
      .get<AdminChatbotDetailStats>(`${BASE}/${workspaceId}/stats`)
      .then((r) => r.data),

  forceUnpublish: (workspaceId: string) =>
    agentClient
      .post<AdminChatbot>(`${BASE}/${workspaceId}/force-unpublish`)
      .then((r) => r.data),
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const adminChatbotKeys = {
  all: ['admin-chatbots'] as const,
  lists: () => [...adminChatbotKeys.all, 'list'] as const,
  list: (params?: ListAdminChatbotParams) =>
    [...adminChatbotKeys.lists(), params] as const,
  stats: () => [...adminChatbotKeys.all, 'stats'] as const,
  detailStats: (workspaceId: string) => [...adminChatbotKeys.all, 'detail-stats', workspaceId] as const,
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAdminChatbotStats() {
  return useQuery({
    queryKey: adminChatbotKeys.stats(),
    queryFn: () => adminChatbotsApi.getStats(),
  })
}

export function useAdminChatbots(params?: ListAdminChatbotParams) {
  return useQuery({
    queryKey: adminChatbotKeys.list(params),
    queryFn: () => adminChatbotsApi.list(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminChatbot(workspaceId: string) {
  return useQuery({
    queryKey: [...adminChatbotKeys.all, 'detail', workspaceId],
    queryFn: () => adminChatbotsApi.getById(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useAdminChatbotDetailStats(workspaceId: string) {
  return useQuery({
    queryKey: adminChatbotKeys.detailStats(workspaceId),
    queryFn: () => adminChatbotsApi.getDetailStats(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useForceUnpublishChatbot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (workspaceId: string) => adminChatbotsApi.forceUnpublish(workspaceId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: adminChatbotKeys.lists() })
      qc.invalidateQueries({ queryKey: adminChatbotKeys.detailStats(data.workspaceId) })
      toast.success(`Chatbot "${data.name}" has been unpublished`)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unpublish chatbot')
    }
  })
}
