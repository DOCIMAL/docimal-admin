import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAdminWorkspaces, type WorkspaceAdminFilters } from '@/api/workspaces.api'
import { Main } from '@/components/layout/main'
import { WorkspaceStatsCards } from '@/components/admin/workspaces/WorkspaceStatsCards'
import { WorkspaceFilters } from '@/components/admin/workspaces/WorkspaceFilters'
import { WorkspaceListTable } from '@/components/admin/workspaces/WorkspaceListTable'
import { ServerPagination } from '@/components/admin/shared/ServerPagination'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route = createFileRoute('/_authenticated/workspaces/' as any)({
  component: AdminWorkspacesPage,
})

function AdminWorkspacesPage() {
  const [filters, setFilters] = useState<WorkspaceAdminFilters>({
    page: 1,
    limit: 10,
    search: '',
  })

  const { data: response, isLoading } = useAdminWorkspaces(filters)

  const workspaces = response?.items || []
  const totalPages = response?.meta.totalPages || 1

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  return (
    <Main>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Workspaces Overview</h1>
          <p className='text-muted-foreground'>
            Manage and monitor all workspaces across the platform.
          </p>
        </div>
      </div>

      <WorkspaceStatsCards />

      <div className='bg-background rounded-xl border p-6 shadow-sm'>
        <WorkspaceFilters filters={filters} setFilters={setFilters} />
        
        <WorkspaceListTable workspaces={workspaces} isLoading={isLoading} />

        {!isLoading && response && response.meta.total > 0 && (
          <div className='mt-6'>
            <ServerPagination
              currentPage={filters.page || 1}
              totalPages={totalPages}
              pageSize={filters.limit || 10}
              totalItems={response.meta.total}
              itemLabel='workspaces'
              onPageChange={handlePageChange}
              onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }))}
            />
          </div>
        )}
      </div>
    </Main>
  )
}
