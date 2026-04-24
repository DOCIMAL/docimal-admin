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
import { type Tenant, useDeleteTenant } from '@/api/tenants.api'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DeleteTenantDialogProps {
  tenant: Tenant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteTenantDialog({
  tenant,
  open,
  onOpenChange,
}: DeleteTenantDialogProps) {
  const { mutate: deleteTenant, isPending } = useDeleteTenant()
  const navigate = useNavigate()
  const [confirmText, setConfirmText] = useState('')

  if (!tenant) return null

  const isConfirmValid = confirmText === tenant.name

  const handleDelete = () => {
    deleteTenant(tenant.id, {
      onSuccess: () => {
        onOpenChange(false)
        navigate({ to: '/tenants' })
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={(val) => {
      if (!val) setConfirmText('')
      onOpenChange(val)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {tenant.name}?</AlertDialogTitle>
          <AlertDialogDescription className='space-y-4'>
            <div>
              This is a <strong className="text-destructive">destructive action</strong>. 
              The tenant and all associated data, users, and workspaces will be permanently soft-deleted from the platform. 
              This action cannot be undone.
            </div>
            
            <div className="space-y-2 text-foreground">
              <Label htmlFor="confirmText" className="text-sm font-medium">
                To confirm, type <strong>{tenant.name}</strong> below:
              </Label>
              <Input 
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={tenant.name}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              if (isConfirmValid) handleDelete()
            }} 
            disabled={isPending || !isConfirmValid}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Permanently Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
