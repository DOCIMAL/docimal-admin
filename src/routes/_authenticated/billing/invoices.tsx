import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Invoices } from '@/features/billing/invoices'

const invoicesSearchSchema = z.object({
  page: z.coerce.number().optional().catch(1),
  limit: z.coerce.number().optional().catch(20),
  status: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .catch(''),
  search: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/billing/invoices')({
  validateSearch: invoicesSearchSchema,
  component: Invoices,
})
