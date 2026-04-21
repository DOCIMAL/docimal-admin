import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useUpdateAiModel } from '../api/useAiModels'
import { useAiModels } from './ai-models-provider'

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tier: z.enum(['free', 'standard', 'premium']),
  isEnabled: z.boolean(),
})
type EditForm = z.infer<typeof editSchema>

export function AiModelsEditDialog() {
  const { open, setOpen, currentRow } = useAiModels()
  const update = useUpdateAiModel()

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: currentRow ? {
      name: currentRow.name,
      description: currentRow.description ?? '',
      tier: currentRow.tier,
      isEnabled: currentRow.isEnabled,
    } : undefined,
  })

  const onSubmit = (values: EditForm) => {
    if (!currentRow) return
    update.mutate(
      { id: currentRow.id, ...values },
      {
        onSuccess: () => { toast.success('Model updated'); setOpen(null) },
        onError: () => toast.error('Failed to update model'),
      }
    )
  }

  return (
    <Dialog open={open === 'edit'} onOpenChange={(v) => !v && setOpen(null)}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit AI Model</DialogTitle>
          <p className='text-sm text-muted-foreground font-mono'>{currentRow?.modelId}</p>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField control={form.control} name='name' render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='description' render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='tier' render={({ field }) => (
              <FormItem>
                <FormLabel>Tier</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='free'>Free</SelectItem>
                    <SelectItem value='standard'>Standard</SelectItem>
                    <SelectItem value='premium'>Premium</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name='isEnabled' render={({ field }) => (
              <FormItem className='flex items-center justify-between rounded-lg border p-3'>
                <FormLabel className='mb-0'>Enabled</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter>
              <Button variant='outline' type='button' onClick={() => setOpen(null)}>Cancel</Button>
              <Button type='submit' disabled={update.isPending}>
                {update.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
