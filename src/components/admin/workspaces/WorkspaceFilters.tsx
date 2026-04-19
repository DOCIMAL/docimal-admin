import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
interface WorkspaceFiltersProps {
  filters: any
  setFilters: (filters: any) => void
}

export const WorkspaceFilters = ({ filters, setFilters }: WorkspaceFiltersProps) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value, page: 1 })
  }

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value === 'all' ? undefined : value, page: 1 })
  }

  const resetFilters = () => {
    setFilters({ page: 1, limit: 10 })
  }

  const hasFilters = filters.search || filters.status

  return (
    <div className='flex flex-wrap items-center gap-4 mb-6'>
      <div className='relative flex-1 min-w-[200px]'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Search workspace name...'
          className='pl-8'
          value={filters.search || ''}
          onChange={handleSearch}
        />
      </div>

      <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className='w-[150px]'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='archived'>Archived</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant='ghost' size='sm' onClick={resetFilters} className='h-10'>
          <X className='mr-2 h-4 w-4' />
          Reset
        </Button>
      )}
    </div>
  )
}
