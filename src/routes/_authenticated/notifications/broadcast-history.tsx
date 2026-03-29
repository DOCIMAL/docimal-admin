import { createFileRoute } from '@tanstack/react-router'
import BroadcastHistoryPage from '@/features/notifications/broadcast-history'

export const Route = createFileRoute('/_authenticated/notifications/broadcast-history')({
  component: BroadcastHistoryPage,
})
