import { useEffect, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import type { AiModel, AiModelQueryParams, AiModelTier } from '../data/schema'

const TIER_OPTIONS: { label: string; value: AiModelTier }[] = [
  { label: 'Free', value: 'free' },
  { label: 'Standard', value: 'standard' },
  { label: 'Premium', value: 'premium' },
]

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
]

interface ServerFacetedFilterProps {
  title: string
  selected: Set<string>
  options: { label: string; value: string }[]
  counts?: Record<string, number>
  onSelectionChange: (values: Set<string>) => void
}

function ServerFacetedFilter({ title, selected, options, counts, onSelectionChange }: ServerFacetedFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircledIcon className='size-4' />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation='vertical' className='mx-2 h-4' />
              <Badge variant='secondary' className='rounded-sm px-1 font-normal lg:hidden'>
                {selected.size}
              </Badge>
              <div className='hidden space-x-1 lg:flex'>
                {selected.size > 2 ? (
                  <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((o) => selected.has(o.value))
                    .map((o) => (
                      <Badge key={o.value} variant='secondary' className='rounded-sm px-1 font-normal'>
                        {o.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[180px] p-0' align='start'>
        <Command>
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const next = new Set(selected)
                      isSelected ? next.delete(option.value) : next.add(option.value)
                      onSelectionChange(next)
                    }}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-sm border border-primary',
                        isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className='h-4 w-4 text-background' />
                    </div>
                    <span>{option.label}</span>
                    {counts?.[option.value] !== undefined && (
                      <span className='ms-auto font-mono text-xs text-muted-foreground'>
                        {counts[option.value]}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onSelectionChange(new Set())}
                    className='justify-center text-center'
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface AiModelsToolbarProps {
  table: Table<AiModel>
  filters: AiModelQueryParams
  total: number
  onFiltersChange: (f: Partial<AiModelQueryParams>) => void
}

export function AiModelsToolbar({ table, filters, total, onFiltersChange }: AiModelsToolbarProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search ?? '')

  // Sync draft when filters are reset externally
  useEffect(() => {
    setSearchDraft(filters.search ?? '')
  }, [filters.search])

  // Debounce search → API
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchDraft.trim() || undefined
      if (trimmed !== filters.search) {
        onFiltersChange({ search: trimmed, page: 1 })
      }
    }, 300)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft])

  const selectedTiers = new Set(filters.tier ? [filters.tier] : [])
  const selectedStatus = new Set<string>(
    filters.isEnabled === true ? ['enabled'] : filters.isEnabled === false ? ['disabled'] : [],
  )

  const handleTierChange = (values: Set<string>) => {
    // API supports single tier — take first selected, undefined if none
    const tier = values.size > 0 ? (Array.from(values)[0] as AiModelTier) : undefined
    onFiltersChange({ tier, page: 1 })
  }

  const handleStatusChange = (values: Set<string>) => {
    let isEnabled: boolean | undefined
    if (values.has('enabled') && !values.has('disabled')) isEnabled = true
    else if (values.has('disabled') && !values.has('enabled')) isEnabled = false
    else isEnabled = undefined
    onFiltersChange({ isEnabled, page: 1 })
  }

  const isFiltered = !!(filters.search || filters.tier || filters.isEnabled !== undefined)

  const handleReset = () => {
    setSearchDraft('')
    onFiltersChange({ search: undefined, tier: undefined, isEnabled: undefined, page: 1 })
  }

  return (
    <div className='flex items-center justify-between gap-2'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder='Search by name or model ID...'
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          className='h-8 w-[200px] lg:w-[280px]'
        />

        <ServerFacetedFilter
          title='Tier'
          selected={selectedTiers}
          options={TIER_OPTIONS}
          onSelectionChange={handleTierChange}
        />

        <ServerFacetedFilter
          title='Status'
          selected={selectedStatus}
          options={STATUS_OPTIONS}
          onSelectionChange={handleStatusChange}
        />

        {isFiltered && (
          <Button variant='ghost' size='sm' className='h-8 px-2' onClick={handleReset}>
            Reset
            <Cross2Icon className='ms-1.5 h-4 w-4' />
          </Button>
        )}

        <span className='text-sm text-muted-foreground'>
          {total.toLocaleString()} model{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Column visibility */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm' className='h-8'>
            <MixerHorizontalIcon className='size-4' />
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[150px]'>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((col) => col.getCanHide())
            .map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                className='capitalize'
                checked={col.getIsVisible()}
                onCheckedChange={(v) => col.toggleVisibility(!!v)}
              >
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
