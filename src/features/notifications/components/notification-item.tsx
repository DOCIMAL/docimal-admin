import { format } from 'date-fns'
import {
  Bell,
  FileText,
  Info,
  MoreHorizontal,
  AtSign,
  Workflow,
  Users,
  Check,
  RotateCcw,
  Trash2,
} from 'lucide-react'

import { Notification } from '@/api/notifications.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  useMarkAsRead,
  useMarkAsUnread,
  useDeleteNotification,
} from '@/api/useAdminNotifications'

const iconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  invitation: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  document_processed: { icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10' },
  workflow_completed: { icon: Workflow, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  mention: { icon: AtSign, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  system: { icon: Info, color: 'text-primary', bg: 'bg-primary/10' },
}

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsRead = useMarkAsRead()
  const markAsUnread = useMarkAsUnread()
  const deleteNotification = useDeleteNotification()

  const handleToggleRead = () => {
    if (notification.read) {
      markAsUnread.mutate(notification.id)
    } else {
      markAsRead.mutate(notification.id)
    }
  }

  const handleDelete = () => {
    deleteNotification.mutate(notification.id)
  }

  const config = iconMap[notification.type] ?? { icon: Bell, color: 'text-muted-foreground', bg: 'bg-muted' }
  const Icon = config.icon

  return (
    <div
      className={cn(
        'group relative flex items-start gap-4 rounded-xl border p-4 transition-all hover:bg-muted/30 hover:shadow-sm',
        !notification.read && 'border-primary/20 bg-primary/5 shadow-xs'
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.bg)}>
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      <div className='flex-1 space-y-1 pr-8'>
        <div className='flex items-center gap-2'>
          <p className={cn('text-sm font-medium leading-none', !notification.read && 'text-foreground')}>
            {notification.title}
          </p>
          {!notification.read && (
            <Badge variant='default' className='h-4 px-1.5 text-[10px] uppercase tracking-wider'>
              New
            </Badge>
          )}
        </div>
        <p className='text-sm text-muted-foreground line-clamp-2'>
          {notification.message}
        </p>
        <div className='flex items-center gap-2 pt-1'>
          <p className='text-xs text-muted-foreground/60 font-medium'>
            {format(new Date(notification.createdAt), 'PP p')}
          </p>
          {notification.readAt && (
            <>
              <span className='h-1 w-1 rounded-full bg-muted-foreground/20' />
              <p className='text-xs text-muted-foreground/40'>
                Read {format(new Date(notification.readAt), 'p')}
              </p>
            </>
          )}
        </div>
      </div>

      <div className='absolute right-2 top-4'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <DropdownMenuItem onClick={handleToggleRead} className='gap-2'>
              {notification.read ? (
                <>
                  <RotateCcw className='h-4 w-4' />
                  Mark as unread
                </>
              ) : (
                <>
                  <Check className='h-4 w-4' />
                  Mark as read
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive gap-2 focus:text-destructive' onClick={handleDelete}>
              <Trash2 className='h-4 w-4' />
              Delete notification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
