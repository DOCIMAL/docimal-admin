import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { apiClient as api } from '@/lib/api-client'
import type { AiModel, AiModelQueryParams, SyncResult } from '../data/schema'

export const aiModelKeys = {
  all: ['ai-models'] as const,
  lists: () => [...aiModelKeys.all, 'list'] as const,
  list: (filters: string) => [...aiModelKeys.lists(), { filters }] as const,
  detail: (id: string) => [...aiModelKeys.all, 'detail', id] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useAiModels = (filters: AiModelQueryParams) =>
  useQuery({
    queryKey: aiModelKeys.list(JSON.stringify(filters)),
    queryFn: async () => {
      const { data } = await api.get('/admin/ai-models', { params: filters })
      return data as { items: AiModel[]; total: number; page: number; limit: number; totalPages: number }
    },
    placeholderData: keepPreviousData,
  })

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useSyncAiModels = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<SyncResult> => {
      const { data } = await api.post('/admin/ai-models/sync')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiModelKeys.lists() }),
  })
}

export const useCreateAiModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<AiModel>) => {
      const { data } = await api.post('/admin/ai-models', payload)
      return data as AiModel
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiModelKeys.lists() }),
  })
}

export const useUpdateAiModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<AiModel> & { id: string }) => {
      const { data } = await api.patch(`/admin/ai-models/${id}`, payload)
      return data as AiModel
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiModelKeys.lists() }),
  })
}

export const useToggleAiModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/ai-models/${id}/toggle`)
      return data as AiModel
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiModelKeys.lists() }),
  })
}

export const useSetDefaultAiModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/ai-models/${id}/set-default`)
      return data as AiModel
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiModelKeys.lists() }),
  })
}

export const useDeleteAiModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/ai-models/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: aiModelKeys.lists() }),
  })
}
