import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAdminWorkspaces } from '@/api/workspaces.api'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { WorkspaceStatsCards } from '@/components/admin/workspaces/WorkspaceStatsCards'
import { WorkspaceFilters } from '@/components/admin/workspaces/WorkspaceFilters'
import { WorkspaceListTable } from '@/components/admin/workspaces/WorkspaceListTable'

export const Route = createFileRoute('/_authenticated/workspaces/' as any)({
  component: AdminWorkspacesPage,
})

function AdminWorkspacesPage() {
  const [filters, setFilters] = useState<any>({
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

        {!isLoading && totalPages > 1 && (
          <div className='flex items-center justify-between mt-6'>
            <div className='text-sm text-muted-foreground'>
              Page {filters.page} of {totalPages}
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Main>
  )
}
