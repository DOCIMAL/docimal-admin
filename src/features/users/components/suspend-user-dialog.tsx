import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSuspendUser, useReactivateUser } from '../api/useAdminUsers'
import { type User } from '../data/schema'

const suspendSchema = z.object({
  scope: z.union([z.literal('global'), z.literal('tenant')]),
  reason: z.string().min(1, 'Please provide a reason'),
})

type SuspendFormValues = z.infer<typeof suspendSchema>

interface SuspendUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function SuspendUserDialog({
  open,
  onOpenChange,
  currentRow,
}: SuspendUserDialogProps) {
  const suspendUser = useSuspendUser()

  const form = useForm<SuspendFormValues>({
    resolver: zodResolver(suspendSchema),
    defaultValues: { scope: 'global', reason: '' },
  })

  const onSubmit = async (data: SuspendFormValues) => {
    try {
      await suspendUser.mutateAsync({
        userId: currentRow.id,
        data: { scope: data.scope, reason: data.reason },
      })
      toast.success(`User ${currentRow.email} suspended successfully.`)
      onOpenChange(false)
      form.reset()
    } catch {
      toast.error('Failed to suspend user.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <ShieldAlert className='h-5 w-5 text-orange-500' />
            <DialogTitle>Suspend User</DialogTitle>
          </div>
          <DialogDescription>
            Suspending <strong>{currentRow.email}</strong> will block their
            access.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='scope'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suspension Scope</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select scope' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='global'>
                        Global – All tenants
                      </SelectItem>
                      <SelectItem value='tenant'>
                        Specific tenant only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter suspension reason...'
                      {...field}
                    />
                  </FormControl>
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
              <Button
                type='submit'
                variant='destructive'
                disabled={suspendUser.isPending}
              >
                {suspendUser.isPending ? 'Suspending...' : 'Suspend User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// ── Reactivate Dialog ──────────────────────────────────────────────────────────

interface ReactivateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function ReactivateUserDialog({
  open,
  onOpenChange,
  currentRow,
}: ReactivateUserDialogProps) {
  const reactivateUser = useReactivateUser()

  const handleReactivate = async () => {
    try {
      await reactivateUser.mutateAsync({
        userId: currentRow.id,
        data: { scope: 'global' },
      })
      toast.success(`User ${currentRow.email} reactivated.`)
      onOpenChange(false)
    } catch {
      toast.error('Failed to reactivate user.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Reactivate User</DialogTitle>
          <DialogDescription>
            Are you sure you want to reactivate{' '}
            <strong>{currentRow.email}</strong>? They will regain access to all
            their tenants.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReactivate}
            disabled={reactivateUser.isPending}
          >
            {reactivateUser.isPending ? 'Reactivating...' : 'Reactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
