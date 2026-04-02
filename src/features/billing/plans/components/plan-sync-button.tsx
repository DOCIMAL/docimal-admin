import { RefreshCw } from 'lucide-react'
import { useSyncPlans } from '@/api/billing.api'
import { Button } from '@/components/ui/button'

export function PlanSyncButton() {
  const { mutate: syncPlans, isPending } = useSyncPlans()

  return (
    <Button
      id='sync-plans-btn'
      variant='outline'
      className='shrink-0'
      onClick={() => syncPlans()}
      disabled={isPending}
    >
      <RefreshCw
        className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
      />
      {isPending ? 'Syncing...' : 'Sync from Stripe'}
    </Button>
  )
}
