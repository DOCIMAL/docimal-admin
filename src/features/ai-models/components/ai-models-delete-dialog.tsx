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
import { useDeleteAiModel } from '../api/useAiModels'
import { useAiModels } from './ai-models-provider'

export function AiModelsDeleteDialog() {
  const { open, setOpen, currentRow, setCurrentRow } = useAiModels()
  const deleteMutation = useDeleteAiModel()

  const handleDelete = () => {
    if (!currentRow) return
    deleteMutation.mutate(currentRow.id, {
      onSuccess: () => {
        toast.success(`Model "${currentRow.name}" deleted`)
        setOpen(null)
        setCurrentRow(null)
      },
      onError: () => toast.error('Failed to delete model'),
    })
  }

  return (
    <AlertDialog open={open === 'delete'} onOpenChange={(v) => !v && setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete AI Model</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{currentRow?.name}</strong>?{' '}
            <span className='font-mono text-xs'>{currentRow?.modelId}</span>
            <br />This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
