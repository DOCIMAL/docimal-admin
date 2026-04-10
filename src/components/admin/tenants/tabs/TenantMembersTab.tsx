import { format } from 'date-fns'
import { MoreHorizontal, UserMinus, ShieldAlert, UserCog } from 'lucide-react'
import { TenantMember, useTenantMembers, useUpdateMemberRole, useSuspendMember, useActivateMember, useRemoveMember } from '@/api/tenants.api'

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
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from '@tanstack/react-router'

export function TenantMembersTab() {
  const { tenantId } = useParams({ from: '/_authenticated/tenants/$tenantId' })
  const { data: members, isLoading } = useTenantMembers(tenantId)
  const { mutate: updateRole } = useUpdateMemberRole(tenantId)
  const { mutate: suspendMember } = useSuspendMember(tenantId)
  const { mutate: activateMember } = useActivateMember(tenantId)
  const { mutate: removeMember } = useRemoveMember(tenantId)


  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tenant Members</CardTitle>
          <CardDescription>View and manage all users associated with this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
          <CardTitle>Tenant Members</CardTitle>
          <CardDescription>View and manage all users associated with this organization.</CardDescription>
        </div>
        <div className="text-sm font-medium">
          Total: {members?.length || 0}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!members || members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No members found for this tenant.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member: TenantMember) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {member.role.replace('TENANT_', '').toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {member.status}
                    </Badge>
                  </TableCell>
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
                        
                        <DropdownMenuItem onClick={() => updateRole({ userId: member.id, role: member.role === 'TENANT_ADMIN' ? 'TENANT_VIEWER' : 'TENANT_ADMIN' })}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Change Role 
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            (to {member.role === 'TENANT_ADMIN' ? 'Viewer' : 'Admin'})
                          </span>
                        </DropdownMenuItem>

                        <DropdownMenuItem 
                          onClick={() => member.status === 'suspended' ? activateMember(member.id) : suspendMember(member.id)}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          {member.status === 'suspended' ? 'Activate Member' : 'Suspend Member'}
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />

                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to remove ${member.name} from this organization?`)) {
                              removeMember(member.id)
                            }
                          }}
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove from Tenant
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
