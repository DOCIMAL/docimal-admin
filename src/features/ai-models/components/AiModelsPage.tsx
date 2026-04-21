import { useState } from 'react'
import { RefreshCw, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { useSyncAiModels } from '../api/useAiModels'
import type { AiModelQueryParams } from '../data/schema'
import { AiModelsProvider } from './ai-models-provider'
import { AiModelsTable } from './ai-models-table'
import { AiModelsDialogs } from './ai-models-dialogs'

export function AiModelsPage() {
  const [filters, setFilters] = useState<AiModelQueryParams>({ page: 1, limit: 50 })
  const sync = useSyncAiModels()

  const handleSync = () => {
    sync.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(
          `Sync complete — ${result.created} created, ${result.updated} updated (${result.total} total from OpenRouter)`
        )
      },
      onError: () => toast.error('Failed to sync models from OpenRouter'),
    })
  }

  return (
    <AiModelsProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Bot className='h-6 w-6 text-primary' />
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>AI Models</h2>
              <p className='text-muted-foreground'>
                Manage available AI models. Sync from OpenRouter to keep the list up to date.
              </p>
            </div>
          </div>
          <Button onClick={handleSync} disabled={sync.isPending} variant='outline'>
            <RefreshCw className={`mr-2 h-4 w-4 ${sync.isPending ? 'animate-spin' : ''}`} />
            {sync.isPending ? 'Syncing...' : 'Sync from OpenRouter'}
          </Button>
        </div>

        <AiModelsTable
          filters={filters}
          onFiltersChange={(f) => setFilters((prev) => ({ ...prev, ...f, page: f.page ?? 1 }))}
        />
      </Main>

      <AiModelsDialogs />
    </AiModelsProvider>
  )
}
