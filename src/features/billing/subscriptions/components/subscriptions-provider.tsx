import { createContext, useContext, useRef } from 'react'
import type { Table } from '@tanstack/react-table'
import type { AdminSubscription } from '@/api/billing.api'

interface SubscriptionsContextType {
  tableRef: React.MutableRefObject<Table<AdminSubscription> | null>
}

const SubscriptionsContext = createContext<
  SubscriptionsContextType | undefined
>(undefined)

export function SubscriptionsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const tableRef = useRef<Table<AdminSubscription> | null>(null)

  return (
    <SubscriptionsContext.Provider
      value={{
        tableRef,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  )
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext)
  if (!context) {
    throw new Error(
      'useSubscriptions must be used within SubscriptionsProvider'
    )
  }
  return context
}
