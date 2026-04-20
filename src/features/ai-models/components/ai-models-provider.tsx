import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AiModel } from '../data/schema'

type DialogType = 'edit' | 'delete' | null

interface AiModelsContextValue {
  open: DialogType
  setOpen: (type: DialogType) => void
  currentRow: AiModel | null
  setCurrentRow: (row: AiModel | null) => void
}

const AiModelsContext = createContext<AiModelsContextValue | null>(null)

export function AiModelsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<DialogType>(null)
  const [currentRow, setCurrentRow] = useState<AiModel | null>(null)

  return (
    <AiModelsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AiModelsContext.Provider>
  )
}

export function useAiModels() {
  const ctx = useContext(AiModelsContext)
  if (!ctx) throw new Error('useAiModels must be used inside AiModelsProvider')
  return ctx
}
