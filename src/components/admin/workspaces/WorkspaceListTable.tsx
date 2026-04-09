import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { MoreHorizontal, ExternalLink, Eye, Building2 } from 'lucide-react'
import { WorkspaceAdmin } from '@/api/workspaces.api'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

interface WorkspaceListTableProps {
  workspaces: WorkspaceAdmin[]
  isLoading: boolean
}

export const WorkspaceListTable = ({ workspaces, isLoading }: WorkspaceListTableProps) => {
  if (isLoading) {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Chatbot</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className='h-4 w-32' /></TableCell>
                <TableCell><Skeleton className='h-4 w-24' /></TableCell>
                <TableCell><Skeleton className='h-4 w-8' /></TableCell>
                <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                <TableCell><Skeleton className='h-4 w-8' /></TableCell>
                <TableCell><Skeleton className='h-4 w-16' /></TableCell>
                <TableCell><Skeleton className='h-8 w-8 rounded-full' /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Chatbot</TableHead>
            <TableHead>Docs</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspaces.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className='h-24 text-center'>
                No workspaces found.
              </TableCell>
            </TableRow>
          ) : (
            workspaces.map((ws) => (
              <TableRow key={ws.id}>
                <TableCell className='font-medium'>
                  <Link 
                    to={'/workspaces/$workspaceId' as any} 
                    params={{ workspaceId: ws.id } as any}
                    className='hover:underline'
                  >
                    {ws.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link 
                    to='/tenants/$tenantId' 
                    params={{ tenantId: ws.tenantId }}
                    className='flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline'
                  >
                    <Building2 className='h-3 w-3' />
                    {ws.tenant?.name || 'Unknown'}
                  </Link>
                </TableCell>
                <TableCell>{ws.membersCount}</TableCell>
                <TableCell>
                  <Badge variant={ws.chatbotStatus === 'Live' ? 'default' : 'outline'} className='gap-1'>
                    <div className={`h-1.5 w-1.5 rounded-full ${ws.chatbotStatus === 'Live' ? 'bg-white' : 'bg-orange-400'}`} />
                    {ws.chatbotStatus}
                  </Badge>
                </TableCell>
                <TableCell>{ws.docsCount}</TableCell>
                <TableCell>
                  <Badge variant={ws.status === 'active' ? 'secondary' : 'outline'} className='capitalize'>
                    {ws.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to={'/workspaces/$workspaceId' as any} params={{ workspaceId: ws.id } as any}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('http://localhost:3000', '_blank')}>
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Launch App
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className='text-destructive'>
                        Archive Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
