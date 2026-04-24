import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MoreHorizontal, 
  ExternalLink, 
  Eye, 
  Trash2, 
  PowerOff,
  Bot
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminChatbot } from '@/api/admin-chatbots.api'
import { useNavigate } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'

interface ChatbotDataTableProps {
  data: AdminChatbot[]
  isLoading?: boolean
  onForceUnpublish: (chatbot: AdminChatbot) => void
  onSort: (column: string) => void
}

export const ChatbotDataTable = ({ 
  data, 
  isLoading, 
  onForceUnpublish,
  onSort 
}: ChatbotDataTableProps) => {
  const navigate = useNavigate()

  const columns: ColumnDef<AdminChatbot>[] = [
    {
      accessorKey: 'name',
      header: () => (
        <Button variant='ghost' onClick={() => onSort('name')} className='-ml-4'>
          Chatbot
        </Button>
      ),
      cell: ({ row }) => {
        const bot = row.original
        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-9 w-9 border'>
              <AvatarImage src={bot.avatarUrl} alt={bot.name} />
              <AvatarFallback><Bot className='h-4 w-4' /></AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='font-medium'>{bot.name}</span>
              <span className='text-xs text-muted-foreground truncate max-w-[150px]'>
                ID: {bot.id.split('-')[0]}...
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'tenantId',
      header: 'Tenant / Workspace',
      cell: ({ row }) => {
        const bot = row.original
        return (
          <div className='flex flex-col'>
            <span className='text-sm font-medium'>Tenant: {bot.tenantId.split('-')[0]}...</span>
            <span className='text-xs text-muted-foreground'>Workspace: {bot.workspaceId.split('-')[0]}...</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'isPublished',
      header: 'Status',
      cell: ({ row }) => {
        const isPublished = row.getValue('isPublished') as boolean
        const version = row.original.publishedVersion
        return (
          <div className='flex items-center gap-2'>
            {isPublished ? (
              <Badge variant='default' className='bg-green-100 text-green-700 hover:bg-green-100 border-green-200'>
                ✅ Live v{version || 1}
              </Badge>
            ) : (
              <Badge variant='secondary' className='bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200'>
                🔶 Draft
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'convos',
      header: 'Convos (30d)',
      cell: () => (
        <span className='text-sm tabular-nums text-muted-foreground'>
          —
        </span>
      ),
    },
    {
      id: 'tokens',
      header: 'Tokens (30d)',
      cell: () => (
        <span className='text-sm tabular-nums text-muted-foreground'>
          —
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const bot = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-48'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate({ to: '/chatbots/$workspaceId', params: { workspaceId: bot.workspaceId } })}>
                <Eye className='mr-2 h-4 w-4' /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/chat/${bot.id}`, '_blank')}>
                <ExternalLink className='mr-2 h-4 w-4' /> Open Public Page
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {bot.isPublished && (
                <DropdownMenuItem 
                  onClick={() => onForceUnpublish(bot)}
                  className='text-destructive focus:text-destructive'
                >
                  <PowerOff className='mr-2 h-4 w-4' /> Force Unpublish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='text-destructive focus:text-destructive'>
                <Trash2 className='mr-2 h-4 w-4' /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(6)].map((_, i) => (
                <TableHead key={i}><Skeleton className='h-4 w-20' /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {[...Array(6)].map((_, j) => (
                  <TableCell key={j}><Skeleton className='h-4 w-full' /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className='rounded-md border bg-card'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className='hover:bg-muted/50 transition-colors cursor-pointer'
                onClick={() => navigate({ to: '/chatbots/$workspaceId', params: { workspaceId: row.original.workspaceId } })}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-24 text-center'>
                No chatbots found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
