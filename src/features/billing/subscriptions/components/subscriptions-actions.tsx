import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import type { AdminSubscription } from '@/api/billing.api'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExtendTrialDialog } from '../../components/extend-trial-dialog'
import { OverridePlanDialog } from '../../components/override-plan-dialog'

export function ActionsCell({ row }: { row: { original: AdminSubscription } }) {
  const { tenantId, tenantName, plan, status, currentPeriodEnd } = row.original
  const [extendTrialOpen, setExtendTrialOpen] = useState(false)
  const [overridePlanOpen, setOverridePlanOpen] = useState(false)

  return (
    <div className='flex justify-center'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem
            onClick={() => {
              window.location.href = `/tenants/${tenantId}`
            }}
          >
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setExtendTrialOpen(true)}>
            Extend Trial
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOverridePlanOpen(true)}>
            Change Plan
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // TODO: Implement cancel subscription
            }}
            className='text-red-600 dark:text-red-400'
          >
            Cancel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExtendTrialDialog
        open={extendTrialOpen}
        onOpenChange={setExtendTrialOpen}
        tenantId={tenantId}
        tenantName={tenantName}
        status={status}
        currentPeriodEnd={currentPeriodEnd}
      />
      <OverridePlanDialog
        open={overridePlanOpen}
        onOpenChange={setOverridePlanOpen}
        tenantId={tenantId}
        tenantName={tenantName}
        currentPlan={plan}
      />
    </div>
  )
}
