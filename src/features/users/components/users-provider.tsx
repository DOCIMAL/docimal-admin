import React, { useRef, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '../data/schema'

type UsersDialogType = 'suspend' | 'reactivate' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  tableRef: React.MutableRefObject<Table<User> | null>
  selectedTenants: Record<string, string>
  setSelectedTenant: (userId: string, tenantId: string) => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)
  const tableRef = useRef<Table<User> | null>(null)
  const [selectedTenants, setSelectedTenants] = useState<Record<string, string>>({})

  const setSelectedTenant = (userId: string, tenantId: string) => {
    setSelectedTenants((prev) => ({ ...prev, [userId]: tenantId }))
  }

  return (
    <UsersContext value={{ open, setOpen, currentRow, setCurrentRow, tableRef, selectedTenants, setSelectedTenant }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
