import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDistanceToNow } from 'date-fns'

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
import { Button } from '@/components/ui/button'
import { useExtendTrial } from '@/api/billing.api'

const formSchema = z.object({
  days: z.coerce.number().min(1, 'Must be at least 1 day').max(90, 'Cannot exceed 90 days'),
})

type FormValues = z.infer<typeof formSchema>

interface ExtendTrialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  tenantName: string
  currentPeriodEnd: string
  status: string
}

export function ExtendTrialDialog({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  currentPeriodEnd,
  status,
}: ExtendTrialDialogProps) {
  const { mutate, isPending } = useExtendTrial()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      days: 14,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({ days: 14 })
    }
  }, [open, form])

  // Calculate days remaining if trialing
  const isTrial = status === 'trialing'
  const today = new Date()
  const endDate = currentPeriodEnd ? new Date(currentPeriodEnd) : null
  const isExpired = endDate ? endDate < today : false
  
  let remainingText = 'No active trial'
  if (isTrial && endDate && !isNaN(endDate.getTime())) {
    if (isExpired) {
      remainingText = 'Expired'
    } else {
      remainingText = formatDistanceToNow(endDate, { addSuffix: true })
    }
  } else if (isTrial) {
    remainingText = 'Unknown end date'
  }

  const onSubmit = (values: FormValues) => {
    mutate(
      { tenantId, days: values.days },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      }
    )
  }

  // To prevent the dialog closing unexpectedly and clearing input when toggled open again, reset when unmounted
  // or handle by parent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extend Trial</DialogTitle>
          <DialogDescription>
            Extend the trial period for <strong>{tenantName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground mr-2">Status:</span>
              <span className="capitalize font-medium">{status}</span>
            </div>
            <div>
              <span className="text-muted-foreground mr-2">Trial valid:</span>
              <span className="font-medium">{remainingText}</span>
            </div>
          </div>

          <Form {...form}>
            <form id="extend-trial-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days to extend</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} max={90} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="extend-trial-form" disabled={isPending}>
            {isPending ? 'Extending...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
