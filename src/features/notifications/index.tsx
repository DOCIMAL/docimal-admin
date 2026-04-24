import { useState } from 'react'
import { BellOff, Filter, Inbox } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  useMarkAllAsRead,
  useNotifications,
  useUnreadCount,
  notificationKeys,
} from '@/api/useAdminNotifications'
import { useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@/api/notifications.api'
import { NotificationPopover } from './components/notification-popover'
import { NotificationItem } from './components/notification-item'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

export default function Notifications() {
  const [filter, setFilter] = useState<{ read?: boolean; type?: string }>({})
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading, isError } = useNotifications({ ...filter, page, limit })
  const { data: unreadData } = useUnreadCount()
  const markAllAsRead = useMarkAllAsRead()
  const queryClient = useQueryClient()

  const handleSimulate = () => {
    const newId = crypto.randomUUID()
    const newNotif = {
      id: newId,
      type: 'system',
      title: 'Simulation: System Alert',
      message: 'This is a simulated notification to test the UI flow. It will disappear on refresh.',
      read: false,
      createdAt: new Date().toISOString(),
    }

    // 1. Update the list cache for the Popover (which uses limit 10, page 1)
    queryClient.setQueryData(notificationKeys.list({ limit: 10, page: 1 }), (old: unknown) => {
      const oldData = old as { data: Notification[]; total?: number }
      const data = oldData?.data || []
      return {
        ...oldData,
        data: [newNotif, ...data].slice(0, 10),
        total: (oldData?.total || 0) + 1,
      }
    })

    // 2. Update the current page's list cache (might be different due to filters/pagination)
    queryClient.setQueryData(notificationKeys.list({ ...filter, page, limit }), (old: unknown) => {
      const oldData = old as { data: Notification[]; total: number; page: number; limit: number; totalPages: number } | undefined
      if (!oldData) return { data: [newNotif], total: 1, page: 1, limit: 20, totalPages: 1 }
      return {
        ...oldData,
        data: [newNotif, ...oldData.data],
        total: oldData.total + 1,
      }
    })

    // 3. Update unread count cache
    queryClient.setQueryData(notificationKeys.unreadCount(), (old: unknown) => {
      const oldData = old as { count: number } | undefined
      if (!oldData) return { count: 1 }
      return { count: (oldData.count || 0) + 1 }
    })
  }

  return (
    <>
      <Header>
        <TopNav links={notificationsNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <NotificationPopover />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='flex flex-col gap-6 h-full'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Notifications</h1>
              <p className='text-sm text-muted-foreground'>
                You have {unreadData?.count ?? 0} unread notifications.
              </p>
            </div>
            <div className='flex gap-2'>
              <Button 
                variant='outline' 
                size='sm' 
                onClick={handleSimulate}
                className='h-9 border-dashed border-primary/50 text-primary hover:bg-primary/5'
              >
                Simulator: New Notification
              </Button>
              {unreadData?.count ? (
                <Button 
                  variant='outline' 
                  size='sm' 
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className='h-9 transition-all'
                >
                  Mark all as read
                </Button>
              ) : null}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <div className='flex items-center rounded-lg border bg-background p-1'>
              <Button
                variant={filter.read === undefined ? 'secondary' : 'ghost'}
                size='sm'
                className='h-7 px-3'
                onClick={() => {
                  setFilter({})
                  setPage(1)
                }}
              >
                All
              </Button>
              <Button
                variant={filter.read === false ? 'secondary' : 'ghost'}
                size='sm'
                className='h-7 px-3'
                onClick={() => {
                  setFilter({ read: false })
                  setPage(1)
                }}
              >
                Unread
              </Button>
              <Button
                variant={filter.read === true ? 'secondary' : 'ghost'}
                size='sm'
                className='h-7 px-3'
                onClick={() => {
                  setFilter({ read: true })
                  setPage(1)
                }}
              >
                Read
              </Button>
            </div>
            <Separator orientation='vertical' className='h-8' />
            <Button variant='ghost' size='sm' className='h-8 gap-2 text-muted-foreground'>
               <Filter className='h-4 w-4' />
               Filters
            </Button>
          </div>

          <Card className='flex-1 flex flex-col overflow-hidden border-none shadow-none bg-transparent'>
            <CardContent className='p-0 flex-1 overflow-hidden'>
               <div className='h-full flex flex-col'>
                {isLoading ? (
                  <div className='grid gap-4'>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className='flex items-start gap-4 p-4 rounded-xl border border-dashed'>
                        <Skeleton className='h-10 w-10 rounded-full' />
                        <div className='flex-1 space-y-2 pt-2'>
                          <Skeleton className='h-4 w-1/4' />
                          <Skeleton className='h-4 w-full' />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isError ? (
                  <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-24 text-center px-4'>
                    <div className='bg-destructive/10 p-4 rounded-full mb-4'>
                      <BellOff className='h-8 w-8 text-destructive' />
                    </div>
                    <h3 className='text-lg font-semibold'>Failed to load notifications</h3>
                    <p className='text-sm text-muted-foreground max-w-xs'>
                      There was a problem connecting to the notification service. Please try again.
                    </p>
                    <Button variant='outline' className='mt-6' onClick={() => window.location.reload()}>
                      Retry loading
                    </Button>
                  </div>
                ) : data?.data.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-32 text-center px-4 border-2 border-dashed rounded-3xl overflow-hidden'>
                    <div className='bg-muted/50 p-6 rounded-full mb-6'>
                      <Inbox className='h-10 w-10 text-muted-foreground/30' />
                    </div>
                    <h3 className='text-lg font-medium'>No notifications found</h3>
                    <p className='text-sm text-muted-foreground max-w-xs'>
                      When you have new updates about your tenants or system status, they'll show up here.
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-3'>
                    {data?.data.map((notif) => (
                      <NotificationItem key={notif.id} notification={notif} />
                    ))}
                  </div>
                )}
               </div>
            </CardContent>

            {data && data.totalPages > 1 && (
              <div className='pt-6 border-t mt-4'>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        size='default'
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        aria-disabled={page <= 1}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        size='default'
                        onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                        aria-disabled={page >= data.totalPages}
                        className={page >= data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </div>
      </Main>
    </>
  )
}

const notificationsNav = [
  {
    title: 'All Notifications',
    href: '/notifications',
    isActive: true,
  },
  {
    title: 'Broadcast',
    href: '/notifications/broadcast',
    isActive: false,
  },
  {
    title: 'History',
    href: '/notifications/broadcast-history',
    isActive: false,
  },
]
