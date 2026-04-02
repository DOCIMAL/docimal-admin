import { createContext, useContext, useRef, type ReactNode } from 'react'
import type { Table } from '@tanstack/react-table'

interface InvoicesContextType {
  tableRef: React.MutableRefObject<Table<any> | null>
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(
  undefined
)

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const tableRef = useRef<Table<any> | null>(null)

  return (
    <InvoicesContext.Provider value={{ tableRef }}>
      {children}
    </InvoicesContext.Provider>
  )
}

export function useInvoices() {
  const context = useContext(InvoicesContext)
  if (!context) {
    throw new Error('useInvoices must be used within an InvoicesProvider')
  }
  return context
}
