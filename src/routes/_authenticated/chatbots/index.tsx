import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { 
  ListAdminChatbotParams, 
  useAdminChatbots,
  useForceUnpublishChatbot,
  AdminChatbot
} from '@/api/admin-chatbots.api'
import { ChatbotStatsCards } from '@/components/admin/chatbots/ChatbotStatsCards'
import { ChatbotFilters } from '@/components/admin/chatbots/ChatbotFilters'
import { ChatbotDataTable } from '@/components/admin/chatbots/ChatbotDataTable'

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/chatbots/')({
  component: ChatbotsListPage,
})

function ChatbotsListPage() {
  const [filters, setFilters] = useState<ListAdminChatbotParams>({
    page: 1,
    limit: 10,
  })

  const { data, isLoading } = useAdminChatbots(filters)
  const { mutate: forceUnpublish } = useForceUnpublishChatbot()

  const handleFilterChange = (newFilters: Partial<ListAdminChatbotParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }))
  }

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleForceUnpublish = (chatbot: AdminChatbot) => {
    if (confirm(`Are you sure you want to force unpublish "${chatbot.name}"? This will disable the bot for all users.`)) {
      forceUnpublish(chatbot.workspaceId)
    }
  }

  const totalPages = data?.meta?.totalPages || 1
  const currentPage = filters.page || 1

  return (
    <>
      <Header>
        <TopNav links={[{ title: 'Chatbots', href: '/chatbots', isActive: true }]} />
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
            <h1 className='text-2xl font-bold tracking-tight'>Chatbot Management</h1>
            <p className='text-muted-foreground'>
              Monitor performance, manage configurations, and control platform-wide chatbot safety.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button size='sm' onClick={() => toast.info('Admin chatbot creation is not enabled. Please create via workspace.')}>
              <Plus className='w-4 h-4 mr-2' />
              Create Chatbot
            </Button>
          </div>
        </div>

        <ChatbotStatsCards />

        <ChatbotFilters onFilterChange={handleFilterChange} />

        <div className='space-y-4'>
          <ChatbotDataTable 
            data={data?.items || []} 
            isLoading={isLoading} 
            onForceUnpublish={handleForceUnpublish}
            onSort={handleSort}
          />

          {/* Pagination */}
          {data && data.meta && data.meta.total > 0 && (
            <div className='flex items-center justify-between py-2 px-1'>
               <div className='text-xs text-muted-foreground'>
                  Showing <span className='text-foreground font-medium'>{(currentPage - 1) * (filters.limit || 10) + 1}</span> to <span className='text-foreground font-medium'>{Math.min(currentPage * (filters.limit || 10), data.meta.total)}</span> of <span className='text-foreground font-medium'>{data.meta.total.toLocaleString()}</span> chatbots
              </div>
              
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='icon' onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading} className='w-8 h-8'>
                  <ChevronLeft className='w-4 h-4' />
                </Button>
                <div className='flex items-center gap-1 mx-2'>
                  <span className='text-sm text-foreground'>{currentPage}</span>
                </div>
                <Button variant='outline' size='icon' onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} className='w-8 h-8'>
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
