import { format } from 'date-fns'
import { Globe, Building2, User, Clock, AlertCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type {
  BroadcastNotificationDetail,
  BroadcastStatus,
} from '@/api/notifications.api'

interface BroadcastDetailSheetProps {
  broadcast: BroadcastNotificationDetail | null
  isLoading: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusVariant: Record<BroadcastStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  processing: 'secondary',
  queued: 'outline',
  failed: 'destructive',
}

const statusLabel: Record<BroadcastStatus, string> = {
  completed: 'Completed',
  processing: 'Processing',
  queued: 'Queued',
  failed: 'Failed',
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[120px_1fr] gap-2 py-2'>
      <span className='text-sm font-medium text-muted-foreground'>{label}</span>
      <span className='text-sm'>{children}</span>
    </div>
  )
}

export function BroadcastDetailSheet({
  broadcast,
  isLoading,
  open,
  onOpenChange,
}: BroadcastDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-md overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Broadcast Details</SheetTitle>
          <SheetDescription>
            View broadcast notification details and delivery information.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className='space-y-4 p-4'>
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ) : broadcast ? (
          <div className='space-y-4 px-4 pb-4'>
            {/* Title */}
            <div>
              <h3 className='text-lg font-semibold'>{broadcast.title}</h3>
              <Badge variant={statusVariant[broadcast.status]} className='mt-1'>
                {statusLabel[broadcast.status]}
              </Badge>
            </div>

            <Separator />

            {/* Message */}
            <div>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Message</p>
              <p className='text-sm whitespace-pre-wrap rounded-md bg-muted/50 p-3'>
                {broadcast.message}
              </p>
            </div>

            <Separator />

            {/* Metadata */}
            <div>
              <DetailRow label='Audience'>
                {broadcast.audienceType === 'all_tenants' ? (
                  <span className='inline-flex items-center gap-1'>
                    <Globe className='h-3.5 w-3.5' />
                    All Tenants
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1'>
                    <Building2 className='h-3.5 w-3.5' />
                    Selected Tenants
                  </span>
                )}
              </DetailRow>

              {broadcast.audienceType === 'selected_tenants' && broadcast.tenantIds && (
                <DetailRow label='Tenant IDs'>
                  <div className='flex flex-wrap gap-1'>
                    {broadcast.tenantIds.map((id) => (
                      <Badge key={id} variant='outline' className='text-xs font-mono'>
                        {id.slice(0, 8)}…
                      </Badge>
                    ))}
                  </div>
                </DetailRow>
              )}

              <DetailRow label='Recipients'>
                <span className='tabular-nums font-medium'>
                  {broadcast.recipientCount.toLocaleString()}
                </span>
              </DetailRow>

              <DetailRow label='Sender'>
                <span className='inline-flex items-center gap-1 font-mono text-xs'>
                  <User className='h-3.5 w-3.5' />
                  {broadcast.senderUserId.slice(0, 8)}…
                </span>
              </DetailRow>

              <DetailRow label='Sent At'>
                <span className='inline-flex items-center gap-1'>
                  <Clock className='h-3.5 w-3.5' />
                  {format(new Date(broadcast.createdAt), 'PPpp')}
                </span>
              </DetailRow>

              {broadcast.completedAt && (
                <DetailRow label='Completed At'>
                  {format(new Date(broadcast.completedAt), 'PPpp')}
                </DetailRow>
              )}

              {broadcast.status === 'failed' && broadcast.failureReason && (
                <>
                  <Separator />
                  <div className='rounded-md border border-destructive/20 bg-destructive/5 p-3'>
                    <div className='flex items-center gap-2 text-destructive'>
                      <AlertCircle className='h-4 w-4' />
                      <span className='text-sm font-medium'>Failure Reason</span>
                    </div>
                    <p className='mt-1 text-sm text-destructive/80'>
                      {broadcast.failureReason}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center p-8'>
            <p className='text-sm text-muted-foreground'>No broadcast selected.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
