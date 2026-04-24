import { format } from 'date-fns'
import { Layout, MoreHorizontal, ExternalLink } from 'lucide-react'
import { type TenantWorkspace, useTenantWorkspaces } from '@/api/tenants.api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from '@tanstack/react-router'

export function TenantWorkspacesTab() {
  const { tenantId } = useParams({ from: '/_authenticated/tenants/$tenantId' })
  const { data: workspaces, isLoading } = useTenantWorkspaces(tenantId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Track workspaces operating within this tenant.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Track workspaces operating within this tenant.</CardDescription>
        </div>
        <div className="text-sm font-medium">
          Total: {workspaces?.length || 0}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Chatbot</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!workspaces || workspaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No workspaces found for this tenant.
                </TableCell>
              </TableRow>
            ) : (
              workspaces.map((ws: TenantWorkspace) => (
                <TableRow key={ws.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                        {ws.avatar ? (
                          <img src={ws.avatar} alt={ws.name} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <Layout className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{ws.name}</div>
                        {ws.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{ws.description}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ws.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {ws.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{ws.memberCount} Members</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ws.chatbotStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(ws.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
