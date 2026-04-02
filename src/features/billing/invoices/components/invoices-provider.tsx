import { createContext, useContext, useRef, type ReactNode } from 'react'
import type { Table } from '@tanstack/react-table'
import type { AdminInvoice } from '@/api/billing.api'

interface InvoicesContextType {
  tableRef: React.MutableRefObject<Table<AdminInvoice> | null>
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(
  undefined
)

export function InvoicesProvider({ children }: { children: ReactNode }) {
  const tableRef = useRef<Table<AdminInvoice> | null>(null)

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
