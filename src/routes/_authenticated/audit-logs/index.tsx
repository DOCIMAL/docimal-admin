import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { type AuditLogFilters, auditApi } from '@/api/audit.api'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { AuditStatsBar } from '@/components/admin/audit-logs/AuditStatsBar'
import { AuditFilters } from '@/components/admin/audit-logs/AuditFilters'
import { AuditLogTable } from '@/components/admin/audit-logs/AuditLogTable'
import { Button } from '@/components/ui/button'
import { 
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ServerPagination } from '@/components/admin/shared/ServerPagination'

export const Route = createFileRoute('/_authenticated/audit-logs/')({
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  })

  const { data, isLoading, isFetching, refetch } = useAuditLogs(filters)

  const handleFilterChange = (newFilters: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1 on filter change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export-audit' })
      const response = await auditApi.exportLogs(filters)
      
      if (response && response.downloadUrl) {
        // Trigger automatic download
        const link = document.createElement('a')
        link.href = response.downloadUrl
        link.setAttribute('download', '')
        link.setAttribute('target', '_blank')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Audit logs exported successfully. Download started.', { id: 'export-audit' })
      } else {
        toast.success('Audit logs exported successfully.', { id: 'export-audit' })
      }
    } catch (_error) {
      toast.error('Failed to export audit logs. Please try again.', { id: 'export-audit' })
    }
  }

  const totalPages = data?.totalPages || 1
  const currentPage = filters.page || 1

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>System Audit Logs</h1>
            <p className='text-muted-foreground'>
              Monitor all platform activities, security events, and administrative actions.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button 
              variant='outline' 
              size='sm' 
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleExport}
              size='sm'
            >
              <Download className='w-4 h-4 mr-2' />
              Export Results
            </Button>
          </div>
        </div>

        <AuditStatsBar />

        <AuditFilters onFilterChange={handleFilterChange} onExport={handleExport} />

        <div className='space-y-4'>
          <AuditLogTable logs={data?.data || []} isLoading={isLoading} />
          
          {/* Pagination */}
          {data && data.total > 0 && (
            <ServerPagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={filters.limit || 50}
              totalItems={data.total}
              itemLabel='logs'
              isLoading={isLoading}
              onPageChange={handlePageChange}
              onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, limit: pageSize, page: 1 }))}
            />
          )}
        </div>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Audit Logs',
    href: '/audit-logs',
    isActive: true,
  },
]
