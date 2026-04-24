import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { type AuditLogFilters, auditApi } from '@/api/audit.api'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { AuditStatsBar } from '@/components/admin/audit-logs/AuditStatsBar'
import { AuditFilters } from '@/components/admin/audit-logs/AuditFilters'
import { AuditLogTable } from '@/components/admin/audit-logs/AuditLogTable'
import { Button } from '@/components/ui/button'
import { 
  ChevronLeft, 
  ChevronRight, 
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
            <div className='flex items-center justify-between py-2 px-1'>
              <div className='text-xs text-muted-foreground'>
                  Showing <span className='text-foreground font-medium'>{(currentPage - 1) * (filters.limit || 50) + 1}</span> to <span className='text-foreground font-medium'>{Math.min(currentPage * (filters.limit || 50), data.total)}</span> of <span className='text-foreground font-medium'>{data.total.toLocaleString()}</span> logs
              </div>
              
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className='w-8 h-8'
                >
                  <ChevronLeft className='w-4 h-4' />
                </Button>
                
                <div className='flex items-center gap-1 mx-2'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                          pageNum = currentPage - 3 + i
                      }
                      if (pageNum > totalPages) {
                          pageNum = totalPages - (4 - i)
                      }
                    }
                    
                    if (pageNum <= 0) return null
                    if (pageNum > totalPages) return null

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handlePageChange(pageNum)}
                        className='w-8 h-8 p-0 text-xs'
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant='outline'
                  size='icon'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className='w-8 h-8'
                >
                  <ChevronRight className='w-4 h-4' />
                </Button>
              </div>
            </div>
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
