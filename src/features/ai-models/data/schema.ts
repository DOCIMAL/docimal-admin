import { z } from 'zod'

export const aiModelTierSchema = z.enum(['free', 'standard', 'premium'])
export type AiModelTier = z.infer<typeof aiModelTierSchema>

export const aiModelSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  provider: z.string(),
  tier: aiModelTierSchema,
  contextLength: z.number().nullable().optional(),
  maxOutputTokens: z.number().nullable().optional(),
  inputPricePer1M: z.number().nullable().optional(),
  outputPricePer1M: z.number().nullable().optional(),
  knowledgeCutoff: z.string().nullable().optional(),
  capabilities: z.object({
    vision: z.boolean(),
    functionCalling: z.boolean(),
    reasoning: z.boolean(),
    structuredOutput: z.boolean(),
    audio: z.boolean(),
    video: z.boolean(),
  }).nullable().optional(),
  isEnabled: z.boolean(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AiModel = z.infer<typeof aiModelSchema>

export interface AiModelQueryParams {
  search?: string
  provider?: string
  tier?: AiModelTier
  isEnabled?: boolean
  page?: number
  limit?: number
}

export interface SyncResult {
  created: number
  updated: number
  total: number
}

// Badge colors per tier
export const tierColors: Record<AiModelTier, string> = {
  free: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

// Badge colors per provider
export const providerColors: Record<string, string> = {
  openai: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  anthropic: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  google: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  meta: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  mistralai: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  deepseek: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
}
