import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type ListAdminChatbotParams } from '@/api/admin-chatbots.api'
import { useTenants } from '@/api/tenants.api'

interface ChatbotFiltersProps {
  onFilterChange: (filters: Partial<ListAdminChatbotParams>) => void
}

export const ChatbotFilters = ({ onFilterChange }: ChatbotFiltersProps) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [tenantId, setTenantId] = useState<string>('all')
  const [model, setModel] = useState<string>('all')

  // Fetch tenants for the dropdown (limit to 100 for filter)
  const { data: tenantsData } = useTenants({ limit: 100 })

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: search || undefined })
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setTenantId('all')
    setModel('all')
    onFilterChange({ 
      search: undefined, 
      status: undefined, 
      tenantId: undefined,
      model: undefined
    })
  }

  return (
    <div className='mb-6 space-y-4 rounded-xl border bg-muted/25 p-4 backdrop-blur-sm'>
      <div className='flex flex-col gap-4 md:flex-row'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search chatbot name...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='grid grid-cols-2 gap-2 md:flex md:w-auto'>
          {/* Tenant Filter */}
          <Select
            value={tenantId}
            onValueChange={(val) => {
              setTenantId(val)
              onFilterChange({ tenantId: val === 'all' ? undefined : val })
            }}
          >
            <SelectTrigger className='w-full md:w-[180px]'>
              <SelectValue placeholder='Select Tenant' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Tenants</SelectItem>
              {tenantsData?.items.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val)
              onFilterChange({ status: val === 'all' ? undefined : (val as 'Published' | 'Draft') })
            }}
          >
            <SelectTrigger className='w-full md:w-[150px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='Published'>Published</SelectItem>
              <SelectItem value='Draft'>Draft</SelectItem>
            </SelectContent>
          </Select>

          {/* LLM Model */}
          <Select
            value={model}
            onValueChange={(val) => {
              setModel(val)
              onFilterChange({ model: val === 'all' ? undefined : val })
            }}
          >
            <SelectTrigger className='w-full md:w-[150px]'>
              <SelectValue placeholder='LLM Model' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Models</SelectItem>
              <SelectItem value='gpt-4o'>GPT-4o</SelectItem>
              <SelectItem value='gpt-4-turbo'>GPT-4 Turbo</SelectItem>
              <SelectItem value='gpt-3.5-turbo'>GPT-3.5 Turbo</SelectItem>
              <SelectItem value='claude-3-5-sonnet'>Claude 3.5 Sonnet</SelectItem>
              <SelectItem value='claude-3-opus'>Claude 3 Opus</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' onClick={clearFilters} className='col-span-2 md:col-span-1'>
            <X className='mr-2 h-4 w-4' />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
