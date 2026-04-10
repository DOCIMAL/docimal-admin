import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Tenant, useSuspendTenant } from '@/api/tenants.api'


interface SuspendTenantDialogProps {
  tenant: Tenant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuspendTenantDialog({
  tenant,
  open,
  onOpenChange,
}: SuspendTenantDialogProps) {
  const { mutate: suspendTenant, isPending } = useSuspendTenant()
  const [reason, setReason] = useState('')


  if (!tenant) return null

  const handleSuspend = () => {
    if (!reason.trim()) return

    suspendTenant({ id: tenant.id, reason }, {
      onSuccess: () => {
        onOpenChange(false)
        setReason('')
      },
    })
  }


  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend {tenant.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will immediately restrict all members of this tenant from accessing their workspaces. 
            Automated backend jobs will also be paused. You can reactivate this tenant at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-2">
          <Label htmlFor="reason">Reason for suspension</Label>
          <Textarea 
            id="reason" 
            placeholder="e.g. Non-payment, violation of terms..." 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <AlertDialogFooter>

          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleSuspend()
            }} 
            disabled={isPending || !reason.trim()}
            className="bg-orange-600 hover:bg-orange-700"

          >
            {isPending ? 'Suspending...' : 'Suspend Tenant'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
