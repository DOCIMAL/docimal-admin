import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Subscriptions } from '@/features/billing/subscriptions'

const subscriptionsSearchSchema = z.object({
  page: z.coerce.number().optional().catch(1),
  limit: z.coerce.number().optional().catch(20),
  plan: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .catch(''),
  status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .catch(''),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/billing/subscriptions')({
  validateSearch: subscriptionsSearchSchema,
  component: Subscriptions,
})
