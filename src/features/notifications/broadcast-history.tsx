import { useState } from 'react'
import { format } from 'date-fns'
import {
  Globe,
  Building2,
  ChevronRight,
  Radio,
  History,
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBroadcasts, useBroadcastDetail } from '@/api/useAdminNotifications'
import type {
  BroadcastAudienceType,
  BroadcastNotificationSummary,
  BroadcastStatus,
} from '@/api/notifications.api'
import { BroadcastDetailSheet } from './broadcast-detail-sheet'

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

function AudienceBadge({ type }: { type: BroadcastAudienceType }) {
  if (type === 'all_tenants') {
    return (
      <Badge variant='outline' className='gap-1'>
        <Globe className='h-3 w-3' />
        All Tenants
      </Badge>
    )
  }
  return (
    <Badge variant='outline' className='gap-1'>
      <Building2 className='h-3 w-3' />
      Selected Tenants
    </Badge>
  )
}

export default function BroadcastHistoryPage() {
  const [page, setPage] = useState(1)
  const [audienceFilter, setAudienceFilter] = useState<BroadcastAudienceType | 'all'>('all')
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null)
  const limit = 20

  const { data, isLoading, isError } = useBroadcasts({
    page,
    limit,
    ...(audienceFilter !== 'all' ? { audienceType: audienceFilter } : {}),
  })

  const { data: detailData, isLoading: detailLoading } = useBroadcastDetail(
    selectedBroadcastId ?? '',
  )

  const broadcasts = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <>
      <Header>
        <TopNav links={notificationsNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Broadcast History</h1>
              <p className='text-sm text-muted-foreground'>
                View previously sent broadcast notifications and delivery status.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className='flex items-center gap-3'>
            <Select
              value={audienceFilter}
              onValueChange={(v) => {
                setAudienceFilter(v as BroadcastAudienceType | 'all')
                setPage(1)
              }}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Filter by audience' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Audiences</SelectItem>
                <SelectItem value='all_tenants'>All Tenants</SelectItem>
                <SelectItem value='selected_tenants'>Selected Tenants</SelectItem>
              </SelectContent>
            </Select>

            {data && (
              <p className='text-sm text-muted-foreground'>
                {data.total} broadcast{data.total !== 1 ? 's' : ''} total
              </p>
            )}
          </div>

          {/* Table */}
          {isLoading ? (
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-14 w-full' />
              ))}
            </div>
          ) : isError ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-24 text-center'>
              <History className='h-8 w-8 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold'>Failed to load broadcast history</h3>
              <p className='text-sm text-muted-foreground'>Please try again later.</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-24 text-center'>
              <Radio className='h-8 w-8 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold'>No broadcasts yet</h3>
              <p className='text-sm text-muted-foreground'>
                Broadcast notifications you send will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead className='text-right'>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className='w-10' />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {broadcasts.map((broadcast: BroadcastNotificationSummary) => (
                      <TableRow
                        key={broadcast.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => setSelectedBroadcastId(broadcast.id)}
                      >
                        <TableCell className='font-medium max-w-[300px] truncate'>
                          {broadcast.title}
                        </TableCell>
                        <TableCell>
                          <AudienceBadge type={broadcast.audienceType} />
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {broadcast.recipientCount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[broadcast.status]}>
                            {statusLabel[broadcast.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {format(new Date(broadcast.createdAt), 'PP p')}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className='px-4 text-sm text-muted-foreground'>
                        Page {page} of {totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </Main>

      {/* Detail Sheet */}
      <BroadcastDetailSheet
        broadcast={detailData ?? null}
        isLoading={detailLoading && selectedBroadcastId !== null}
        open={selectedBroadcastId !== null}
        onOpenChange={(open: boolean) => {
          if (!open) setSelectedBroadcastId(null)
        }}
      />
    </>
  )
}

const notificationsNav = [
  {
    title: 'All Notifications',
    href: '/notifications',
    isActive: false,
  },
  {
    title: 'Broadcast',
    href: '/notifications/broadcast',
    isActive: false,
  },
  {
    title: 'History',
    href: '/notifications/broadcast-history',
    isActive: true,
  },
]
