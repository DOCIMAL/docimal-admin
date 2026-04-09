import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'


const BASE = '/admin/workspaces'

export interface WorkspaceAdminBase {
  id: string
  name: string
  description?: string
  status: 'active' | 'archived'
  tenantId: string
  tenant: {
    id: string
    name: string
    slug: string
  }
  createdAt: string
  avatar?: string
}

export interface WorkspaceAdmin extends WorkspaceAdminBase {
  membersCount: number
  chatbotStatus: string
  docsCount: number
}

export interface WorkspaceAdminStats {
  total: number
  active: number
  archived: number
  withChatbot: number
}

export interface WorkspaceAdminDetail extends WorkspaceAdminBase {
  members: Array<{
    id: string
    name: string
    email: string
    role: string
    joinedAt: string
  }>
  chatbot?: {
    id: string
    name: string
    status: string
    model?: string
    versions: Array<{
      id: string
      version: number
      description: string | null
      createdAt: string
      isLatest: boolean
    }>
  } | null
  documents: {
    stats: {
      total_documents: number
      total_storage_mb: number
      total_knowledge_bases: number
    }
    knowledgeBases: Array<{
      id: string
      name: string
      description?: string
      document_count: number
      created_at: string
    }>
  }
  memoryTables: Array<{
    id: string
    name: string
    displayName: string
    description?: string
    rowCount: number
    createdAt: string
  }>
  integrations: Array<{
    id: string
    name: string
    status: string
    lastUsedAt?: string
    integration: {
      name: string
    }
  }>
  stats: {
    chatbots: number
    documents: number
    integrations: number
    memoryTables: number
  }
}

export const workspaceAdminKeys = {
  all: ['admin-workspaces'] as const,
  lists: () => [...workspaceAdminKeys.all, 'list'] as const,
  list: (filters: any) => [...workspaceAdminKeys.lists(), { filters }] as const,
  stats: () => [...workspaceAdminKeys.all, 'stats'] as const,
  details: () => [...workspaceAdminKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceAdminKeys.details(), id] as const,
}

export const workspacesAdminApi = {
  findAll: (params: any) =>
    apiClient
      .get<any>(BASE, { params })
      .then((r) => r.data),

  getStats: () =>
    apiClient.get<WorkspaceAdminStats>(`${BASE}/stats`).then((r) => r.data),

  findOne: (id: string) =>
    apiClient.get<WorkspaceAdminDetail>(`${BASE}/${id}`).then((r) => r.data),
}

export function useAdminWorkspaces(params: any) {
  return useQuery({
    queryKey: workspaceAdminKeys.list(params),
    queryFn: () => workspacesAdminApi.findAll(params),
  })
}

export function useAdminWorkspaceStats() {
  return useQuery({
    queryKey: workspaceAdminKeys.stats(),
    queryFn: () => workspacesAdminApi.getStats(),
  })
}

export function useAdminWorkspaceDetail(id: string) {
  return useQuery({
    queryKey: workspaceAdminKeys.detail(id),
    queryFn: () => workspacesAdminApi.findOne(id),
    enabled: !!id,
  })
}
