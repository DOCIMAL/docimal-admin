import { RotateCcw, AlertTriangle } from 'lucide-react'
import { useResetAllQuotas } from '@/api/billing.api'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

export function ResetAllQuotasButton() {
  const [open, setOpen] = useState(false)
  const { mutate: resetAllQuotas, isPending, data } = useResetAllQuotas()

  const handleConfirm = () => {
    resetAllQuotas(undefined, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          className='shrink-0 gap-2'
          disabled={isPending}
        >
          <RotateCcw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Resetting...' : 'Reset All Quotas'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-amber-500' />
            Reset All Tenant Quotas?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will reset quota settings for <strong>ALL tenants</strong> to
            the current PLAN_QUOTAS defaults. This action cannot be undone.
            {data && data.results && (
              <div className='mt-4 space-y-2'>
                <p className='font-medium'>Last reset results:</p>
                <ul className='text-sm space-y-1'>
                  <li>✓ {data.successCount} tenants updated</li>
                  <li>✗ {data.failedCount} tenants failed</li>
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className=''
          >
            {isPending && <span className='h-4 w-4 animate-spin'>↻</span>}
            <span className='text-white'>Reset All Quotas</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
