import { createFileRoute } from '@tanstack/react-router'
import BroadcastComposePage from '@/features/notifications/broadcast-compose'

export const Route = createFileRoute('/_authenticated/notifications/broadcast')({
  component: BroadcastComposePage,
})
