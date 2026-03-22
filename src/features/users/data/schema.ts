import { z } from 'zod'

export const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

// User overview from Super Admin API (real data)
export const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  authProvider: z.string(),
  role: z.string().optional().nullable(),
  emailVerified: z.boolean(),
  status: userStatusSchema,
  tenantCount: z.number(),
  primaryTenant: z
    .object({ id: z.string(), name: z.string(), role: z.string() })
    .optional()
    .nullable(),
  tenantMemberships: z.array(
    z.object({
      tenant: z.object({ id: z.string(), name: z.string() }),
      role: z.string(),
    })
  ).optional(),
  createdAt: z.coerce.date(),
  lastLoginAt: z.coerce.date().optional().nullable(),
})

export type User = z.infer<typeof userSchema>
export const userListSchema = z.array(userSchema)
