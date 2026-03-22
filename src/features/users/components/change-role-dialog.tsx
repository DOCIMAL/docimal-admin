import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useUpdateUserTenantRole,
  useRemoveUserFromTenant,
} from '../api/useAdminUsers'

// ── Change Role Dialog ──────────────────────────────────────────
const changeRoleSchema = z.object({
  role: z.union([
    z.literal('tenant_owner'),
    z.literal('tenant_admin'),
    z.literal('user'),
  ]),
})
type ChangeRoleForm = z.infer<typeof changeRoleSchema>

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  tenantId: string
  tenantName: string
  currentRole: string
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  userId,
  tenantId,
  tenantName,
  currentRole,
}: ChangeRoleDialogProps) {
  const updateRole = useUpdateUserTenantRole()

  const form = useForm<ChangeRoleForm>({
    resolver: zodResolver(changeRoleSchema),
    defaultValues: {
      role: currentRole as 'tenant_owner' | 'tenant_admin' | 'user',
    },
  })

  const onSubmit = async (data: ChangeRoleForm) => {
    try {
      await updateRole.mutateAsync({ userId, tenantId, role: data.role })
      toast.success(`Role updated to "${data.role}" in "${tenantName}".`)
      onOpenChange(false)
    } catch {
      toast.error('Failed to update role.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update role in <strong>{tenantName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='tenant_owner'>👑 Owner</SelectItem>
                      <SelectItem value='tenant_admin'>🛡️ Admin</SelectItem>
                      <SelectItem value='user'>👤 Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateRole.isPending}>
                {updateRole.isPending ? 'Saving...' : 'Save Role'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ── Remove From Tenant Dialog ───────────────────────────────────
interface RemoveFromTenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  tenantId: string
  tenantName: string
}

export function RemoveFromTenantDialog({
  open,
  onOpenChange,
  userId,
  tenantId,
  tenantName,
}: RemoveFromTenantDialogProps) {
  const removeUser = useRemoveUserFromTenant()

  const handleRemove = async () => {
    try {
      await removeUser.mutateAsync({ userId, tenantId })
      toast.success(`User removed from "${tenantName}".`)
      onOpenChange(false)
    } catch {
      toast.error('Failed to remove user from tenant.')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from Tenant</AlertDialogTitle>
          <AlertDialogDescription>
            ⚠️ The user will lose access to <strong>all workspaces</strong> in{' '}
            <strong>{tenantName}</strong>. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={removeUser.isPending}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            {removeUser.isPending ? 'Removing...' : 'Remove from Tenant'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
