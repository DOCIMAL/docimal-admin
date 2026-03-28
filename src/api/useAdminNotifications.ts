import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from './notifications.api'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: object) => [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}

export function useNotifications(params?: { page?: number; limit?: number; read?: boolean; type?: string }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.getNotifications(params),
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000, // poll every 30s
  })
}

export function useMarkAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

export function useMarkAsUnread() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAsUnread,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}

export function useMarkAllAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onMutate: async () => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: notificationKeys.unreadCount() })
      const previousCount = qc.getQueryData<{ count: number }>(notificationKeys.unreadCount())
      qc.setQueryData<{ count: number }>(notificationKeys.unreadCount(), { count: 0 })
      return { previousCount }
    },
    onError: (_err, _vars, context) => {
      // Rollback optimistic update on error
      if (context?.previousCount) {
        qc.setQueryData(notificationKeys.unreadCount(), context.previousCount)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.lists() })
      qc.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
