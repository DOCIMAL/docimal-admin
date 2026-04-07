import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notificationsApi } from '@/api/notifications.api'

// Common IANA timezones for the selector
const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const formSchema = z
  .object({
    emailEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    inAppEnabled: z.boolean(),
    quietHoursStart: z.string().optional(),
    quietHoursEnd: z.string().optional(),
    timezone: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasStart = !!data.quietHoursStart
      const hasEnd = !!data.quietHoursEnd
      // Both must be set together, or both empty
      return hasStart === hasEnd
    },
    {
      message: 'Both start and end time are required for quiet hours.',
      path: ['quietHoursEnd'],
    }
  )

type FormValues = z.infer<typeof formSchema>

const QUERY_KEY = ['notification-preferences'] as const

export function NotificationsForm() {
  const queryClient = useQueryClient()

  const { data: prefs, isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => notificationsApi.getPreferences(),
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailEnabled: true,
      pushEnabled: true,
      inAppEnabled: true,
      quietHoursStart: '',
      quietHoursEnd: '',
      timezone: 'UTC',
    },
    // `values` syncs the form when `prefs` loads from the server
    values: prefs
      ? {
          emailEnabled: prefs.emailEnabled ?? true,
          pushEnabled: prefs.pushEnabled ?? true,
          inAppEnabled: prefs.inAppEnabled ?? true,
          quietHoursStart: prefs.quietHoursStart ?? '',
          quietHoursEnd: prefs.quietHoursEnd ?? '',
          timezone: prefs.timezone ?? 'UTC',
        }
      : undefined,
  })

  const updatePrefs = useMutation({
    mutationFn: (data: FormValues) =>
      notificationsApi.updatePreferences({
        ...data,
        // Send undefined instead of empty string so BE can clear quiet hours
        quietHoursStart: data.quietHoursStart || undefined,
        quietHoursEnd: data.quietHoursEnd || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Notification preferences updated')
    },
    onError: () => {
      toast.error('Failed to update preferences. Please try again.')
    },
  })

  const isSaving = updatePrefs.isPending

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => updatePrefs.mutate(data))}
        className='space-y-8'
      >
        {/* Channels Section */}
        <div>
          <h3 className='mb-4 text-lg font-medium'>Notification Channels</h3>
          <div className='space-y-4'>
            <FormField
              control={form.control}
              name='emailEnabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Email notifications</FormLabel>
                    <FormDescription>
                      Receive notifications and alerts via email.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving || isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='pushEnabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Push notifications</FormLabel>
                    <FormDescription>
                      Receive real-time push notifications on your browser or device.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving || isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='inAppEnabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>In-app notifications</FormLabel>
                    <FormDescription>
                      Show notifications in the Docimal Admin interface.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving || isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Quiet Hours Section */}
        <div>
          <h3 className='mb-1 text-lg font-medium'>Quiet Hours</h3>
          <p className='mb-4 text-sm text-muted-foreground'>
            Suppress push notifications during a specific time window.
          </p>
          <div className='flex flex-wrap gap-6'>
            <FormField
              control={form.control}
              name='quietHoursStart'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1.5'>
                  <FormLabel>From</FormLabel>
                  <FormControl>
                    <input
                      type='time'
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={isSaving || isLoading}
                      className='h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='quietHoursEnd'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1.5'>
                  <FormLabel>To</FormLabel>
                  <FormControl>
                    <input
                      type='time'
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      disabled={isSaving || isLoading}
                      className='h-9 w-36 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring disabled:opacity-50'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Timezone Section */}
        <FormField
          control={form.control}
          name='timezone'
          render={({ field }) => {
            // Ensure the stored value is always rendered even if not in the preset list
            const currentTz = field.value ?? 'UTC'
            const tzOptions = COMMON_TIMEZONES.includes(currentTz)
              ? COMMON_TIMEZONES
              : [currentTz, ...COMMON_TIMEZONES]

            return (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base'>Timezone</FormLabel>
                  <FormDescription>
                    Used to calculate your quiet hours window correctly.
                  </FormDescription>
                </div>
                <FormControl>
                  <Select
                    value={currentTz}
                    onValueChange={field.onChange}
                    disabled={isSaving || isLoading}
                  >
                    <SelectTrigger className='w-48'>
                      <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                      {tzOptions.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )
          }}
        />

        <Button type='submit' disabled={isSaving || isLoading}>
          {isSaving ? 'Saving...' : 'Update notifications'}
        </Button>
      </form>
    </Form>
  )
}
