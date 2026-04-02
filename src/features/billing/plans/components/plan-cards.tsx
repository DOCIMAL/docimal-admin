import { AlertCircle } from 'lucide-react'
import { useAdminPlans } from '@/api/billing.api'
import { PlanCard, PlanCardSkeleton } from './plan-card'

export function PlanCards() {
  const { data: plans, isLoading, isError } = useAdminPlans()

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <PlanCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
        <AlertCircle className='h-4 w-4 shrink-0' />
        Failed to load plans. Please try again.
      </div>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <div className='rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground'>
        No plans found. Sync from Stripe to load plans.
      </div>
    )
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
