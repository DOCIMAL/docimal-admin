import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Bell, Check } from 'lucide-react'
import { format } from 'date-fns'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
  useUnreadCount,
} from '@/api/useAdminNotifications'
import type { Notification } from '@/api/notifications.api'

export function NotificationPopover() {
  const [open, setOpen] = useState(false)
  const { data: unreadData } = useUnreadCount()
  const { data: notificationsData, isLoading } = useNotifications({
    limit: 10,
    page: 1,
  })
  const markAllAsRead = useMarkAllAsRead()
  const markAsRead = useMarkAsRead()

  const unreadCount = unreadData?.count ?? 0
  const notifications = notificationsData?.data ?? []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute right-2 top-2 flex h-4 w-4 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0 sm:w-96'>
        <div className='flex items-center justify-between p-4'>
          <h4 className='text-sm font-semibold text-foreground'>Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant='ghost'
              size='sm'
              className='h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground'
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className='mr-1 h-3 w-3' />
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className='h-[400px]'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Bell className='mb-2 h-8 w-8 text-muted-foreground/20' />
              <p className='text-sm text-muted-foreground'>No notifications yet</p>
            </div>
          ) : (
            <div className='flex flex-col'>
              {notifications.map((notif) => (
                <NotificationItemMini
                  key={notif.id}
                  notification={notif}
                  onMarkRead={() => markAsRead.mutate(notif.id)}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className='p-2'>
          <Button
            variant='ghost'
            className='w-full justify-center text-sm'
            asChild
            onClick={() => setOpen(false)}
          >
            <Link to='/notifications'>View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationItemMini({
  notification,
  onMarkRead,
  onClose,
}: {
  notification: Notification
  onMarkRead: () => void
  onClose: () => void
}) {
  return (
    <div
      className={cn(
        'group relative flex cursor-pointer flex-col gap-1 p-4 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-muted/10'
      )}
      onClick={onClose}
    >
      <div className='flex items-start justify-between gap-2'>
        <p className={cn('text-sm', !notification.read && 'font-semibold')}>
          {notification.title}
        </p>
        {!notification.read && (
          <div className='mt-1 h-2 w-2 rounded-full bg-primary' />
        )}
      </div>
      <p className='line-clamp-2 text-xs text-muted-foreground'>
        {notification.message}
      </p>
      <p className='text-[10px] text-muted-foreground/60'>
        {format(new Date(notification.createdAt), 'PP p')}
      </p>
      {!notification.read && (
        <Button
          variant='ghost'
          size='icon'
          className='absolute bottom-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={(e) => {
            e.stopPropagation()
            onMarkRead()
          }}
        >
          <Check className='h-3 w-3' />
        </Button>
      )}
    </div>
  )
}
