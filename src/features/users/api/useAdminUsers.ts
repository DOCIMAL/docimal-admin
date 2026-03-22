import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient as api } from '@/lib/api-client';

// Các interfaces tương ứng với backend DTOs
export interface UserOverview {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  authProvider: string;
  emailVerified: boolean;
  status: string;
  tenantCount: number;
  primaryTenant?: { id: string; name: string; role: string } | null;
  tenantMemberships?: Array<{
    tenant: { id: string; name: string };
    role: string;
  }>;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserFullDetail extends UserOverview {
  tenantMemberships: Array<{
    tenant: { id: string; name: string; slug: string; plan: string; status: string };
    role: string;
    status: string;
    isDefault: boolean;
    joinedAt: string;
  }>;
  workspaceMemberships: any[];
  stats: {
    totalConversations: number;
    totalDocumentsUploaded: number;
    totalWorkflows: number;
    lastActiveAt: string;
  };
}

export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters: string) => [...adminUserKeys.lists(), { filters }] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
  activity: (id: string) => [...adminUserKeys.detail(id), 'activity'] as const,
  workspaces: (id: string) => [...adminUserKeys.detail(id), 'workspaces'] as const,
};

// ========================
// QUERIES
// ========================

export const useAdminUsers = (filters: Record<string, any>) => {
  return useQuery({
    queryKey: adminUserKeys.list(JSON.stringify(filters)),
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: filters });
      return data as { data: UserOverview[], meta: any };
    },
  });
};

export const useAdminUserDetail = (userId: string) => {
  return useQuery({
    queryKey: adminUserKeys.detail(userId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data as UserFullDetail;
    },
    enabled: !!userId,
  });
};

export const useAdminUserActivity = (userId: string, filters?: any) => {
  return useQuery({
    queryKey: adminUserKeys.activity(userId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}/activity`, { params: filters });
      return data;
    },
    enabled: !!userId,
  });
};

export const useInfiniteAdminUserActivity = (userId: string) => {
  return useInfiniteQuery({
    queryKey: [...adminUserKeys.activity(userId), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get(`/admin/users/${userId}/activity`, {
        params: { page: pageParam, limit: 20 },
      });
      return data as { data: any[]; meta: { page: number; totalPages: number } };
    },
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled: !!userId,
  });
};

export const useAdminUserWorkspaces = (userId: string) => {
  return useQuery({
    queryKey: adminUserKeys.workspaces(userId),
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}/workspaces`);
      return data as { data: any[]; meta: any };
    },
    enabled: !!userId,
  });
};

// ========================
// MUTATIONS
// ========================

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: { scope: 'global' | 'tenant'; tenantId?: string; reason: string } }) => {
      const response = await api.post(`/admin/users/${userId}/suspend`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

export const useReactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: { scope: 'global' | 'tenant'; tenantId?: string } }) => {
      const response = await api.post(`/admin/users/${userId}/reactivate`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};

export const useUpdateUserTenantRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, tenantId, role }: { userId: string, tenantId: string, role: string }) => {
      const response = await api.patch(`/admin/users/${userId}/tenants/${tenantId}/role`, { role });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.userId) });
    },
  });
};

export const useRemoveUserFromTenant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, tenantId }: { userId: string, tenantId: string }) => {
      const response = await api.delete(`/admin/users/${userId}/tenants/${tenantId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(variables.userId) });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
    },
  });
};
