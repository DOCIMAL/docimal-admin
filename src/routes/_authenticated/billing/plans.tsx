import { createFileRoute } from '@tanstack/react-router'
import { Plans } from '@/features/billing/plans'

export const Route = createFileRoute('/_authenticated/billing/plans')({
  component: Plans,
})
