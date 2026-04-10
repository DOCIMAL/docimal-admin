import { createFileRoute, Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { 
  useAdminWorkspaceDetail, 
  useAdminUpdateWorkspaceMemberRole, 
  useAdminRemoveWorkspaceMember,
  useAdminWorkspaceRoles 
} from '@/api/workspaces.api'
import { 
  MoreHorizontal, 
  UserMinus, 
  UserCog,
  ArrowLeft, 
  Building2, 
  Bot, 
  Settings2, 
  Calendar,
  ExternalLink
} from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/_authenticated/workspaces/$workspaceId')({
  component: AdminWorkspaceDetailPage,
})

function AdminWorkspaceDetailPage() {
  const { workspaceId } = Route.useParams()
  const { data: workspace, isLoading } = useAdminWorkspaceDetail(workspaceId)
  const { mutate: updateRole } = useAdminUpdateWorkspaceMemberRole(workspaceId)
  const { mutate: removeMember } = useAdminRemoveWorkspaceMember(workspaceId)
  const { data: roles } = useAdminWorkspaceRoles(workspaceId)

  if (isLoading) {
    return (
      <Main>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </Main>
    )
  }

  if (!workspace) return <Main>Workspace not found</Main>

  return (
    <Main>
      <div className='flex items-center gap-4 mb-6'>
        <Button variant='ghost' size='icon' asChild>
          <Link to='/workspaces'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <div>
          <div className='flex items-center gap-2'>
            <h1 className='text-3xl font-bold tracking-tight'>{workspace.name}</h1>
            <Badge variant={workspace.status === 'active' ? 'secondary' : 'outline'}>
              {workspace.status}
            </Badge>
          </div>
          <div className='flex items-center gap-4 text-muted-foreground text-sm mt-1'>
            <div className='flex items-center gap-1'>
               <Building2 className='h-3.5 w-3.5' />
               Tenant: <Link to='/tenants/$tenantId' params={{ tenantId: workspace.tenantId }} className="underline hover:text-foreground">{workspace.tenant?.name}</Link>
            </div>
            <div className='flex items-center gap-1'>
               <Calendar className='h-3.5 w-3.5' />
               Created: {format(new Date(workspace.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
        <div className='ml-auto flex gap-2'>
          <Button variant='outline'>
            <Settings2 className='mr-2 h-4 w-4' />
            Settings
          </Button>
          <Button onClick={() => window.open('http://localhost:3000', '_blank')}>
            <ExternalLink className='mr-2 h-4 w-4' />
            Launch App
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.members?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chatbots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats?.chatbots || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats?.documents || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspace.stats?.integrations || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='members'>Members</TabsTrigger>
          <TabsTrigger value='chatbot'>Chatbot</TabsTrigger>
          <TabsTrigger value='docs'>Documents</TabsTrigger>
          <TabsTrigger value='integrations'>Integrations</TabsTrigger>
          <TabsTrigger value='memory'>Memory</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
           <Card>
            <CardHeader>
              <CardTitle>Workspace Overview</CardTitle>
              <CardDescription>General information and current health status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Description</span>
                  <p>{workspace.description || 'No description provided'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">Tenant ID</span>
                  <p className="font-mono text-xs">{workspace.tenantId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='members'>
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
              <CardDescription>Full list of users with access to this specific workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined At</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.members?.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{member.role}</TableCell>
                      <TableCell>{format(new Date(member.joinedAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {roles?.map((role) => (
                              <DropdownMenuItem 
                                key={role.id}
                                onClick={() => updateRole({ userId: member.id, roleId: role.id })}
                                disabled={member.role === role.name}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Change to {role.name}
                              </DropdownMenuItem>
                            ))}
                            
                            <DropdownMenuSeparator />

                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${member.name} from this workspace?`)) {
                                  removeMember(member.id)
                                }
                              }}
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Workspace
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='chatbot'>
          {workspace.chatbot ? (
            <div className='grid gap-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Chatbot Configuration</CardTitle>
                  <CardDescription>Primary settings for the assistant in this workspace.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>Name</span>
                      <p className='font-medium'>{workspace.chatbot.name}</p>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>Status</span>
                      <div>
                        <Badge variant={workspace.chatbot.status === 'active' ? 'secondary' : 'outline'}>
                          {workspace.chatbot.status}
                        </Badge>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>Model</span>
                      <p className='font-mono text-sm'>{workspace.chatbot.model || 'Default'}</p>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>ID</span>
                      <p className='font-mono text-[10px] break-all'>{workspace.chatbot.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>Recent publishes and configuration snapshots.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workspace.chatbot?.versions?.length > 0 ? (
                        workspace.chatbot.versions.map((v) => (
                          <TableRow key={v.id}>
                            <TableCell className='font-medium'>v{v.version}</TableCell>
                            <TableCell>
                              <Badge variant={v.isLatest ? 'default' : 'secondary'} className='text-[10px]'>
                                {v.isLatest ? 'Current' : 'Legacy'}
                              </Badge>
                            </TableCell>
                            <TableCell className='max-w-[200px] truncate'>{v.description || 'No description'}</TableCell>
                            <TableCell className='text-muted-foreground'>{format(new Date(v.createdAt), 'MMM dd, HH:mm')}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                            No version history available for this chatbot.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <Bot className='h-4 w-4' />
              <AlertTitle>No Chatbot Found</AlertTitle>
              <AlertDescription>
                This workspace does not currently have a chatbot configured.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value='docs' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Total Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{workspace.documents.stats.total_documents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{workspace.documents.stats.total_storage_mb} MB</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Knowledge Bases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{workspace.documents.stats.total_knowledge_bases}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Bases</CardTitle>
              <CardDescription>Logical groupings of documents within this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.documents?.knowledgeBases?.length > 0 ? (
                    workspace.documents.knowledgeBases.map((kb) => (
                      <TableRow key={kb.id}>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{kb.name}</span>
                            <span className='text-xs text-muted-foreground line-clamp-1'>{kb.description || 'No description'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{kb.document_count} docs</TableCell>
                        <TableCell className='text-muted-foreground'>{format(new Date(kb.created_at), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                        No knowledge bases found in this workspace.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='integrations'>
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>Third-party connections configured for this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.integrations?.length > 0 ? (
                    workspace.integrations.map((conn) => (
                      <TableRow key={conn.id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <div className='h-8 w-8 rounded bg-muted flex items-center justify-center font-bold text-xs'>
                              {conn.integration?.name?.[0] || 'I'}
                            </div>
                            <div className='flex flex-col'>
                              <span className='font-medium'>{conn.name}</span>
                              <span className='text-xs text-muted-foreground'>{conn.integration?.name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={conn.status === 'active' ? 'secondary' : 'outline'}>
                            {conn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {conn.lastUsedAt ? format(new Date(conn.lastUsedAt), 'MMM dd, HH:mm') : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                        No active integrations found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='memory' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>Total Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{workspace.stats.memoryTables}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Memory Tables</CardTitle>
              <CardDescription>
                Structured data tables used by chatbot workflows for long-term storage and retrieval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.memoryTables?.length > 0 ? (
                    workspace.memoryTables.map((table) => (
                      <TableRow key={table.id}>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{table.displayName}</span>
                            <span className='text-xs text-muted-foreground font-mono'>
                              {table.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-sm line-clamp-2'>
                            {table.description || 'No description provided'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{table.rowCount} rows</Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {format(new Date(table.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                        No memory tables found in this workspace.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Main>
  )
}
