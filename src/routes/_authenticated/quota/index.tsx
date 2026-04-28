import { createFileRoute } from '@tanstack/react-router'
import { QuotaManagement } from '@/features/quota'

export const Route = createFileRoute('/_authenticated/quota/')({
  component: QuotaManagement,
})
