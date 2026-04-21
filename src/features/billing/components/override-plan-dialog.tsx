import { useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useOverridePlan, type SubscriptionPlan } from '@/api/billing.api'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

const formSchema = z.object({
  plan: z.enum(['free', 'starter', 'professional', 'enterprise'], {
    message: 'Please select a plan',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface OverridePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  tenantName: string
  currentPlan: string
}

export function OverridePlanDialog({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  currentPlan,
}: OverridePlanDialogProps) {
  const { mutate, isPending } = useOverridePlan()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plan: currentPlan as SubscriptionPlan,
    },
  })

  // Set default when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ plan: currentPlan as SubscriptionPlan })
    }
  }, [open, currentPlan, form])

  const onSubmit = (values: FormValues) => {
    mutate(
      { tenantId, plan: values.plan },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override Plan</DialogTitle>
          <DialogDescription>
            Change the subscription plan for <strong>{tenantName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <Alert
            variant='destructive'
            className='border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200'
          >
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              This action changes the plan directly, bypassing Stripe. Quotas
              will be updated based on the new plan.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form
              id='override-plan-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='plan'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Plan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='capitalize'>
                          <SelectValue placeholder='Select a plan' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='free'>Free</SelectItem>
                        <SelectItem value='starter'>Starter</SelectItem>
                        <SelectItem value='professional'>
                          Professional
                        </SelectItem>
                        <SelectItem value='enterprise'>Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type='submit' form='override-plan-form' disabled={isPending}>
            {isPending ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
