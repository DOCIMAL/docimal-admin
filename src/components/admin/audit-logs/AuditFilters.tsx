import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Search, X, Calendar as CalendarIcon } from 'lucide-react'
import { AuditLogFilters } from '@/api/audit.api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AuditFiltersProps {
  onFilterChange: (filters: Partial<AuditLogFilters>) => void
  onExport: () => void
}

export const AuditFilters = ({
  onFilterChange,
  onExport,
}: AuditFiltersProps) => {
  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: search || undefined })
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Handle date changes
  useEffect(() => {
    onFilterChange({
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    })
  }, [startDate, endDate])

  const clearFilters = () => {
    setSearch('')
    setSeverity('all')
    setStatus('all')
    setStartDate(undefined)
    setEndDate(undefined)
    onFilterChange({
      search: undefined,
      severity: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    })
  }

  return (
    <div className='mb-6 space-y-4 rounded-xl border bg-muted/25 p-4 backdrop-blur-sm'>
      <div className='flex flex-col gap-4 md:flex-row'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search action, resource, or details...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={onExport}>
            Export CSV
          </Button>
          <Button variant='outline' size='sm' onClick={clearFilters}>
            <X className='mr-2 h-4 w-4' />
            Clear
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        {/* Severity */}
        <Select
          value={severity}
          onValueChange={(val) => {
            setSeverity(val)
            onFilterChange({ severity: val === 'all' ? undefined : val })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Severity' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Severities</SelectItem>
            <SelectItem value='INFO'>Info</SelectItem>
            <SelectItem value='WARNING'>Warning</SelectItem>
            <SelectItem value='ERROR'>Error</SelectItem>
            <SelectItem value='CRITICAL'>Critical</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val)
            onFilterChange({ status: val === 'all' ? undefined : val })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='SUCCESS'>Success</SelectItem>
            <SelectItem value='FAILED'>Failed</SelectItem>
            <SelectItem value='PENDING'>Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filters */}
        <div className='flex flex-col gap-2 md:col-span-2 md:flex-row'>
          <div className='flex-1'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='startDate'
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {startDate ? (
                    format(startDate, 'MMM dd, yyyy')
                  ) : (
                    <span>From Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='single'
                  selected={startDate}
                  onSelect={setStartDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className='flex-1'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='endDate'
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {endDate ? (
                    format(endDate, 'MMM dd, yyyy')
                  ) : (
                    <span>To Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  initialFocus
                  mode='single'
                  selected={endDate}
                  onSelect={setEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  )
}
