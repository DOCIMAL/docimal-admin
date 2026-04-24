import { useState, useEffect } from 'react'
import { Search, X, Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { type ListTenantsParams, type TenantStatus, type TenantPlan } from '@/api/tenants.api'


interface TenantFiltersProps {
  onFilterChange: (filters: Partial<ListTenantsParams> & { search?: string }) => void
}

export const TenantFilters = ({ onFilterChange }: TenantFiltersProps) => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [plan, setPlan] = useState<string>('all')
  const [date, setDate] = useState<DateRange | undefined>()


  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: search || undefined })
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setPlan('all')
    setDate(undefined)
    onFilterChange({ 
      search: undefined, 
      status: undefined, 
      plan: undefined,
      from: undefined,
      to: undefined
    })
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) {
      onFilterChange({
        from: range.from.toISOString(),
        to: range.to.toISOString()
      })
    } else if (!range) {
      onFilterChange({ from: undefined, to: undefined })
    }
  }


  return (
    <div className='mb-6 space-y-4 rounded-xl border bg-muted/25 p-4 backdrop-blur-sm'>
      <div className='flex flex-col gap-4 md:flex-row'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search tenant name or slug...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='grid grid-cols-2 gap-2 md:flex md:w-auto'>
          {/* Status */}
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val)
              onFilterChange({ status: val === 'all' ? undefined : (val as TenantStatus) })
            }}
          >
            <SelectTrigger className='w-full md:w-[150px]'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='suspended'>Suspended</SelectItem>
              <SelectItem value='inactive'>Inactive</SelectItem>
              <SelectItem value='trial'>Trial</SelectItem>
            </SelectContent>
          </Select>

          {/* Plan */}
          <Select
            value={plan}
            onValueChange={(val) => {
              setPlan(val)
              onFilterChange({ plan: val === 'all' ? undefined : (val as TenantPlan) })
            }}
          >
            <SelectTrigger className='w-full md:w-[150px]'>
              <SelectValue placeholder='Plan' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Plans</SelectItem>
              <SelectItem value='free'>Free</SelectItem>
              <SelectItem value='starter'>Starter</SelectItem>
              <SelectItem value='pro'>Pro</SelectItem>
              <SelectItem value='enterprise'>Enterprise</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full md:w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Created date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>


          <Button variant='outline' onClick={clearFilters} className='col-span-2 md:col-span-1'>
            <X className='mr-2 h-4 w-4' />
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
