import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Mail,
  Calendar,
  Key,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Clock,
  Building2,
  Globe,
  Briefcase,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Search } from '@/components/search'
import {
  useAdminUserDetail,
  useReactivateUser,
  useAdminUserWorkspaces,
  useAdminUserActivity,
} from '../api/useAdminUsers'
import { ChangeRoleDialog, RemoveFromTenantDialog } from './change-role-dialog'
import { SuspendUserDialog } from './suspend-user-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { RoleLabel } from './role-label'

type TenantDialogState = {
  type: 'changeRole' | 'remove'
  tenantId: string
  tenantName: string
  currentRole: string
} | null

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Never'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelative(dateStr?: string | null): string {
  if (!dateStr) return 'Never'
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffH / 24)
  if (diffH < 1) return 'Just now'
  if (diffH < 24) return `${diffH}h ago`
  if (diffD < 30) return `${diffD}d ago`
  return d.toLocaleDateString()
}

const statusColors: Record<string, string> = {
  active: 'bg-teal-100/30 text-teal-800 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  suspended:
    'bg-destructive/10 text-destructive border-destructive/20',
  inactive: 'bg-muted text-muted-foreground border-muted-foreground/20',
}

const tenantStatusColors: Record<string, string> = {
  active: 'bg-teal-100/30 text-teal-800 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  suspended: 'bg-orange-100/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminUserDetailPage({ userId }: { userId: string }) {
  const { data: user, isLoading } = useAdminUserDetail(userId)
  const { data: workspacesData } = useAdminUserWorkspaces(userId)
  const { data: activityData } = useAdminUserActivity(userId)
  const reactivateUser = useReactivateUser()
  const [tenantDialog, setTenantDialog] = useState<TenantDialogState>(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
          <Skeleton className='h-5 w-32' />
          <div className='space-y-4'>
            <Skeleton className='h-40 w-full rounded-lg' />
            <Skeleton className='h-64 w-full rounded-lg' />
          </div>
        </Main>
      </>
    )
  }

  // ─── Not found ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className='flex flex-col items-center justify-center h-64 gap-4'>
          <p className='text-muted-foreground text-lg'>User not found.</p>
          <Link to='/users'>
            <Button variant='outline'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Users
            </Button>
          </Link>
        </Main>
      </>
    )
  }

  const initials =
    `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
    user.email[0].toUpperCase()

  const userForDialog = {
    ...user,
    status: user.status as any,
    createdAt: new Date(user.createdAt),
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
  }

  const workspaces = (workspacesData as any)?.data ?? user.workspaceMemberships ?? []
  const activities = (activityData as any)?.data ?? []

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Breadcrumb */}
        <Link
          to='/users'
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Users
        </Link>

        {/* ── Profile Card ─────────────────────────────────────────── */}
        <Card>
          <CardContent className='pt-6 pb-6'>
            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-6'>
              {/* Left: Avatar + Info */}
              <div className='flex items-start gap-5'>
                <Avatar className='h-16 w-16 text-xl shrink-0'>
                  <AvatarImage
                    src={user.avatar}
                    alt={initials}
                    className='object-cover'
                  />
                  <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className='space-y-2'>
                  {/* Name + Status badges */}
                  <div className='flex items-center gap-2 flex-wrap'>
                    <h1 className='text-2xl font-bold tracking-tight'>
                      {user.firstName} {user.lastName}
                    </h1>
                    <Badge
                      variant='outline'
                      className={`capitalize ${statusColors[user.status] ?? ''}`}
                    >
                      {user.status}
                    </Badge>
                    {user.emailVerified && (
                      <Badge
                        variant='outline'
                        className='bg-sky-100/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800'
                      >
                        <ShieldCheck className='h-3 w-3 mr-1' />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* Meta info */}
                  <div className='flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground'>
                    <span className='inline-flex items-center gap-1.5'>
                      <Mail className='h-3.5 w-3.5' />
                      {user.email}
                    </span>
                    <span className='inline-flex items-center gap-1.5 capitalize'>
                      <Key className='h-3.5 w-3.5' />
                      {user.authProvider}
                    </span>
                    <span className='inline-flex items-center gap-1.5'>
                      <Calendar className='h-3.5 w-3.5' />
                      Joined {formatDate(user.createdAt)}
                    </span>
                    <span className='inline-flex items-center gap-1.5'>
                      <Clock className='h-3.5 w-3.5' />
                      Last login: {formatRelative(user.lastLoginAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action buttons */}
              <div className='flex gap-2 shrink-0'> 
                {user.status === 'inactive' ? (
                  <Button
                    variant='outline'
                    size='sm'
                    className='text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                    onClick={async () => {
                      try {
                        await reactivateUser.mutateAsync({
                          userId,
                          data: { scope: 'global' },
                        })
                        toast.success('User restored.')
                      } catch {
                        toast.error('Failed to restore user.')
                      }
                    }}
                    disabled={reactivateUser.isPending}
                  >
                    <ShieldCheck className='h-4 w-4 mr-1.5' />
                    {reactivateUser.isPending ? 'Restoring...' : 'Restore'}
                  </Button>
                ) : (
                  <>
                    {user.status !== 'suspended' ? (
                      <Button
                        variant='outline'
                        size='sm'
                        className='text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                        onClick={() => setSuspendOpen(true)}
                      >
                        <ShieldAlert className='h-4 w-4 mr-1.5' />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={async () => {
                          try {
                            await reactivateUser.mutateAsync({
                              userId,
                              data: { scope: 'global' },
                            })
                            toast.success('User reactivated.')
                          } catch {
                            toast.error('Failed to reactivate user.')
                          }
                        }}
                        disabled={reactivateUser.isPending}
                      >
                        <ShieldCheck className='h-4 w-4 mr-1.5' />
                        {reactivateUser.isPending ? 'Reactivating...' : 'Reactivate'}
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant='outline'
                  size='sm'
                  className='text-destructive border-destructive/30 hover:bg-destructive/10'
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className='h-4 w-4 mr-1.5' />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats Cards ──────────────────────────────────────────── */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='px-5 py-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 rounded-md bg-primary/10'>
                    <Building2 className='h-3.5 w-3.5 text-primary' />
                  </div>
                  <p className='text-sm font-medium text-muted-foreground'>Tenants</p>
                </div>
                <p className='text-xl font-bold'>
                  {user.tenantMemberships?.length ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='px-5 py-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 rounded-md bg-blue-500/10'>
                    <Briefcase className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                  </div>
                  <p className='text-sm font-medium text-muted-foreground'>Workspaces</p>
                </div>
                <p className='text-xl font-bold'>{workspaces.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='px-5 py-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 rounded-md bg-teal-500/10'>
                    <Activity className='h-3.5 w-3.5 text-teal-600 dark:text-teal-400' />
                  </div>
                  <p className='text-sm font-medium text-muted-foreground'>Conversations</p>
                </div>
                <p className='text-xl font-bold'>
                  {user.stats?.totalConversations ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='px-5 py-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='p-1.5 rounded-md bg-violet-500/10'>
                    <Globe className='h-3.5 w-3.5 text-violet-600 dark:text-violet-400' />
                  </div>
                  <p className='text-sm font-medium text-muted-foreground'>Documents</p>
                </div>
                <p className='text-xl font-bold'>
                  {user.stats?.totalDocumentsUploaded ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <Tabs defaultValue='tenants' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='tenants' className='gap-1.5'>
              <Building2 className='h-3.5 w-3.5' />
              Tenants ({user.tenantMemberships?.length ?? 0})
            </TabsTrigger>
            <TabsTrigger value='workspaces' className='gap-1.5'>
              <Briefcase className='h-3.5 w-3.5' />
              Workspaces ({workspaces.length})
            </TabsTrigger>
            <TabsTrigger value='activity' className='gap-1.5'>
              <Activity className='h-3.5 w-3.5' />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* ── Tenant Memberships Tab ─────────────────────────────── */}
          <TabsContent value='tenants'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Tenant Memberships</CardTitle>
                <CardDescription>
                  All organizations this user belongs to and their role in each.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='pl-0'>Tenant</TableHead>
                      <TableHead className='text-center'>Role</TableHead>
                      <TableHead className='text-center'>Status</TableHead>
                      <TableHead className='text-center'>Joined</TableHead>
                      <TableHead className='text-center pr-0 w-[180px]'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.tenantMemberships?.length ? (
                      user.tenantMemberships.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className='pl-0'>
                            <div className='flex items-center gap-2'>
                              <span className='font-medium'>
                                {m.tenant.name}
                              </span>
                              {m.isDefault && (
                                <Badge
                                  variant='outline'
                                  className='text-[10px] px-1.5 py-0'
                                >
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {m.tenant.slug && (
                              <span className='text-xs text-muted-foreground'>
                                {m.tenant.slug}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className='flex justify-center'>
                              <RoleLabel role={m.role} />
                            </div>
                          </TableCell>
                          <TableCell className='text-center'>
                            <Badge
                              variant='outline'
                              className={`capitalize ${tenantStatusColors[m.status] ?? ''}`}
                            >
                              {m.status}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-center text-sm text-muted-foreground'>
                            {formatDate(m.joinedAt)}
                          </TableCell>
                          <TableCell className='pr-0'>
                            <div className='flex justify-end gap-1.5'>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-7 text-xs'
                                onClick={() =>
                                  setTenantDialog({
                                    type: 'changeRole',
                                    tenantId: m.tenant.id,
                                    tenantName: m.tenant.name,
                                    currentRole: m.role,
                                  })
                                }
                              >
                                Change Role
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10'
                                onClick={() =>
                                  setTenantDialog({
                                    type: 'remove',
                                    tenantId: m.tenant.id,
                                    tenantName: m.tenant.name,
                                    currentRole: m.role,
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='h-24 text-center text-muted-foreground'
                        >
                          No tenant memberships found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Workspaces Tab ─────────────────────────────────────── */}
          <TabsContent value='workspaces'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Workspace Memberships</CardTitle>
                <CardDescription>
                  Workspaces this user has access to across all tenants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workspaces.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='pl-0'>Workspace</TableHead>
                        <TableHead>Tenant</TableHead>
                        <TableHead className='text-center'>Role</TableHead>
                        <TableHead className='pr-0'>Permissions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workspaces.map((w: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell className='font-medium pl-0'>
                            {w.workspace?.name ?? w.name ?? '—'}
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {w.tenantName ?? w.tenant?.name ?? '—'}
                          </TableCell>
                          <TableCell>
                            <div className='flex justify-center'>
                              <RoleLabel role={w.role} />
                            </div>
                          </TableCell>
                          <TableCell className='text-xs text-muted-foreground max-w-[200px] truncate'>
                            {w.permissions?.join(', ') ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className='flex flex-col items-center justify-center py-16 text-muted-foreground gap-2'>
                    <Briefcase className='h-10 w-10 opacity-20' />
                    <p>No workspace memberships found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activity Tab ───────────────────────────────────────── */}
          <TabsContent value='activity'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Activity Timeline</CardTitle>
                <CardDescription>
                  Recent user actions across all tenants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length ? (
                  <div className='space-y-0'>
                    {activities.map((item: any, i: number) => (
                      <div key={i} className='flex gap-4 py-3'>
                        <div className='flex flex-col items-center'>
                          <div className='h-2 w-2 rounded-full bg-primary mt-2' />
                          {i < activities.length - 1 && (
                            <div className='flex-1 w-px bg-border mt-1' />
                          )}
                        </div>
                        <div className='flex-1 pb-2'>
                          <p className='text-sm'>
                            {item.description ?? item.action ?? 'Activity'}
                          </p>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className='text-xs text-muted-foreground'>
                              {formatRelative(item.createdAt ?? item.timestamp)}
                            </span>
                            {item.tenantName && (
                              <Badge
                                variant='outline'
                                className='text-[10px] px-1.5 py-0'
                              >
                                {item.tenantName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-16 text-muted-foreground gap-2'>
                    <Activity className='h-10 w-10 opacity-20' />
                    <p>No activity recorded yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>

      {/* ── Dialogs ──────────────────────────────────────────────── */}
      {suspendOpen && (
        <SuspendUserDialog
          open={suspendOpen}
          onOpenChange={setSuspendOpen}
          currentRow={userForDialog}
        />
      )}
      {deleteOpen && (
        <UsersDeleteDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          currentRow={userForDialog}
        />
      )}
      {tenantDialog?.type === 'changeRole' && (
        <ChangeRoleDialog
          open
          onOpenChange={() => setTenantDialog(null)}
          userId={userId}
          tenantId={tenantDialog.tenantId}
          tenantName={tenantDialog.tenantName}
          currentRole={tenantDialog.currentRole}
        />
      )}
      {tenantDialog?.type === 'remove' && (
        <RemoveFromTenantDialog
          open
          onOpenChange={() => setTenantDialog(null)}
          userId={userId}
          tenantId={tenantDialog.tenantId}
          tenantName={tenantDialog.tenantName}
        />
      )}
    </>
  )
}
