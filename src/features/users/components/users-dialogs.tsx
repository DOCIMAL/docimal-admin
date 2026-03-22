import { SuspendUserDialog, ReactivateUserDialog } from './suspend-user-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  const closeAndClear = (dialog: typeof open) => {
    setOpen(dialog)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      {currentRow && (
        <>
          <SuspendUserDialog
            key={`user-suspend-${currentRow.id}`}
            open={open === 'suspend'}
            onOpenChange={() => closeAndClear('suspend')}
            currentRow={currentRow}
          />

          <ReactivateUserDialog
            key={`user-reactivate-${currentRow.id}`}
            open={open === 'reactivate'}
            onOpenChange={() => closeAndClear('reactivate')}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => closeAndClear('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
