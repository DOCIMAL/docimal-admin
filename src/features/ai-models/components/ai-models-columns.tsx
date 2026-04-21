import { type ColumnDef } from '@tanstack/react-table'
import { Star, Eye, Mic, Video, Wrench, Brain, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { type AiModel, tierColors } from '../data/schema'
import { useToggleAiModel, useSetDefaultAiModel } from '../api/useAiModels'
import { useAiModels as useAiModelsContext } from './ai-models-provider'
import { ProviderIcon } from '@lobehub/icons'
import { normalizeProviderKey } from '@/lib/provider-icon-key'

function formatPrice(price?: number | string | null): string {
  if (price === undefined || price === null) return '—'
  const n = Number(price)
  if (isNaN(n)) return '—'
  if (n === 0) return 'Free'
  return `$${n.toFixed(2)}`
}

function formatContext(tokens?: number | null): string {
  if (!tokens) return '—'
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`
  return String(tokens)
}

function CapabilityDots({ model }: { model: AiModel }) {
  const caps = model.capabilities
  if (!caps) return <span className='text-muted-foreground text-xs'>—</span>
  const items = [
    { icon: Eye, label: 'Vision', active: caps.vision },
    { icon: Wrench, label: 'Function calling', active: caps.functionCalling },
    { icon: Brain, label: 'Reasoning', active: caps.reasoning },
    { icon: Mic, label: 'Audio', active: caps.audio },
    { icon: Video, label: 'Video', active: caps.video },
  ]
  return (
    <div className='flex gap-1'>
      {items.map(({ icon: Icon, label, active }) =>
        active ? (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <span className='text-primary'>
                <Icon className='h-3.5 w-3.5' />
              </span>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ) : null
      )}
    </div>
  )
}

function ToggleCell({ model }: { model: AiModel }) {
  const toggle = useToggleAiModel()
  return (
    <div className='flex justify-center'>
      <Switch
        checked={model.isEnabled}
        onCheckedChange={() => toggle.mutate(model.id)}
        disabled={toggle.isPending}
        aria-label='Toggle model'
      />
    </div>
  )
}

function ActionsCell({ model }: { model: AiModel }) {
  const { setOpen, setCurrentRow } = useAiModelsContext()
  const setDefault = useSetDefaultAiModel()

  return (
    <div className='flex justify-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => { setCurrentRow(model); setOpen('edit') }}
          >
            <Pencil className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          {!model.isDefault && (
            <DropdownMenuItem onClick={() => setDefault.mutate(model.id)}>
              <Star className='mr-2 h-4 w-4' /> Set as default
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => { setCurrentRow(model); setOpen('delete') }}
          >
            <Trash2 className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const aiModelsColumns: ColumnDef<AiModel>[] = [
  {
    id: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Model' />,
    accessorKey: 'name',
    cell: ({ row }) => {
      const { name, modelId, provider, isDefault } = row.original
      return (
        <div className='flex items-center gap-2.5 min-w-[160px]'>
          <ProviderIcon provider={normalizeProviderKey(provider)} size={28} type='avatar' className='shrink-0 rounded-md' />
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              <span className='font-medium leading-none'>{name}</span>
              {isDefault && (
                <Tooltip>
                  <TooltipTrigger>
                    <Star className='h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0' />
                  </TooltipTrigger>
                  <TooltipContent>Default model</TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className='mt-0.5 font-mono text-[11px] text-muted-foreground truncate max-w-[200px]'>{modelId}</div>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => {
      const provider = row.original.provider
      return (
        <div className='flex items-center gap-1.5'>
          <ProviderIcon provider={normalizeProviderKey(provider)} size={16} type='mono' />
          <span className='text-sm capitalize'>{provider}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'tier',
    header: 'Tier',
    cell: ({ row }) => {
      const tier = row.original.tier
      return (
        <Badge variant='outline' className={cn('capitalize text-xs', tierColors[tier])}>
          {tier}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'contextLength',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Context' />,
    cell: ({ row }) => (
      <span className='text-sm tabular-nums'>{formatContext(row.original.contextLength)}</span>
    ),
  },
  {
    id: 'inputPrice',
    header: 'Input / 1M',
    cell: ({ row }) => (
      <span className='text-sm tabular-nums'>{formatPrice(row.original.inputPricePer1M)}</span>
    ),
  },
  {
    id: 'outputPrice',
    header: 'Output / 1M',
    cell: ({ row }) => (
      <span className='text-sm tabular-nums'>{formatPrice(row.original.outputPricePer1M)}</span>
    ),
  },
  {
    id: 'capabilities',
    header: 'Capabilities',
    cell: ({ row }) => <CapabilityDots model={row.original} />,
  },
  {
    id: 'isEnabled',
    header: () => <div className='text-center'>Enabled</div>,
    cell: ({ row }) => <ToggleCell model={row.original} />,
  },
  {
    id: 'actions',
    header: () => <div className='text-center'>Actions</div>,
    cell: ({ row }) => <ActionsCell model={row.original} />,
  },
]
