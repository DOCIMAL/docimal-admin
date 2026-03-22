import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDeleteUser } from '../api/useAdminUsers'
import { type User } from '../data/schema'

interface UsersDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: UsersDeleteDialogProps) {
  const deleteUser = useDeleteUser()
  // Step 1 = warning, Step 2 = type email to confirm
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmEmail, setConfirmEmail] = useState('')

  const isConfirmed = confirmEmail.trim() === currentRow.email

  const handleClose = (val: boolean) => {
    if (!val) {
      setStep(1)
      setConfirmEmail('')
    }
    onOpenChange(val)
  }

  const handleDelete = async () => {
    if (!isConfirmed) return
    try {
      await deleteUser.mutateAsync(currentRow.id)
      toast.success(`User ${currentRow.email} deleted.`)
      handleClose(false)
    } catch {
      toast.error('Failed to delete user.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <div className='flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5 text-destructive' />
                <AlertDialogTitle>Delete User?</AlertDialogTitle>
              </div>
              <AlertDialogDescription className='space-y-2'>
                <p>
                  You are about to permanently delete{' '}
                  <strong>{currentRow.firstName} {currentRow.lastName}</strong>{' '}
                  (<span className='font-mono text-xs'>{currentRow.email}</span>).
                </p>
                <p className='text-destructive font-medium'>
                  This will remove them from all tenants and workspaces and cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant='destructive' onClick={() => setStep(2)}>
                Yes, continue →
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <div className='flex items-center gap-2'>
                <Trash2 className='h-5 w-5 text-destructive' />
                <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Type <span className='font-mono font-semibold text-foreground'>{currentRow.email}</span> to permanently delete this user.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className='space-y-2 my-1'>
              <Label htmlFor='confirm-email' className='text-sm font-medium'>
                Confirm email address
              </Label>
              <Input
                id='confirm-email'
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={currentRow.email}
                autoComplete='off'
                autoFocus
              />
            </div>

            <AlertDialogFooter>
              <Button variant='outline' onClick={() => setStep(1)}>
                ← Back
              </Button>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={!isConfirmed || deleteUser.isPending}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
