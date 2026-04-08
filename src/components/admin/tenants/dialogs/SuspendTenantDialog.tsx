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

  if (!tenant) return null

  const handleSuspend = () => {
    suspendTenant(tenant.id, {
      onSuccess: () => {
        onOpenChange(false)
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleSuspend()
            }} 
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending ? 'Suspending...' : 'Suspend Tenant'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
