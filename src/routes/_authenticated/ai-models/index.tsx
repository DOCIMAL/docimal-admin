import { createFileRoute } from '@tanstack/react-router'
import { AiModelsPage } from '@/features/ai-models'

export const Route = createFileRoute('/_authenticated/ai-models/')({
  component: AiModelsPage,
})
