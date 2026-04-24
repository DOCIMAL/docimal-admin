interface AuditChangesDiffProps {
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export const AuditChangesDiff = ({ before, after }: AuditChangesDiffProps) => {
  if (!before && !after) return null

  const keys = Array.from(
    new Set([...Object.keys(before || {}), ...Object.keys(after || {})])
  ).filter(
    (k) => k !== '_id' && k !== 'id' && k !== 'updatedAt' && k !== 'createdAt'
  )

  return (
    <div className='mt-2 grid grid-cols-1 gap-2'>
      <div className='flex overflow-hidden rounded-lg border border-border bg-background shadow-sm'>
        <div className='flex-1 border-r border-border p-3'>
          <span className='mb-2 block text-[10px] font-bold tracking-wider text-destructive uppercase'>
            Before
          </span>
          <div className='space-y-1.5'>
            {keys.map((key) => {
              const valBefore = before?.[key]
              const valAfter = after?.[key]
              const isChanged =
                JSON.stringify(valBefore) !== JSON.stringify(valAfter)

              return (
                <div
                  key={key}
                  className={`flex gap-2 text-xs ${isChanged ? '-mx-1 rounded bg-destructive/10 px-1' : ''}`}
                >
                  <span className='w-24 shrink-0 truncate font-mono text-muted-foreground'>
                    {key}:
                  </span>
                  <span className='font-mono break-all text-foreground'>
                    {valBefore === undefined ? (
                      <span className='text-muted-foreground italic'>
                        undefined
                      </span>
                    ) : (
                      JSON.stringify(valBefore)
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className='flex-1 p-3'>
          <span className='mb-2 block text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400'>
            After
          </span>
          <div className='space-y-1.5'>
            {keys.map((key) => {
              const valBefore = before?.[key]
              const valAfter = after?.[key]
              const isChanged =
                JSON.stringify(valBefore) !== JSON.stringify(valAfter)

              return (
                <div
                  key={key}
                  className={`flex gap-2 text-xs ${isChanged ? '-mx-1 rounded bg-emerald-500/10 px-1 dark:bg-emerald-500/20' : ''}`}
                >
                  <span className='w-24 shrink-0 truncate font-mono text-muted-foreground'>
                    {key}:
                  </span>
                  <span className='font-mono break-all text-foreground'>
                    {valAfter === undefined ? (
                      <span className='text-muted-foreground italic'>
                        undefined
                      </span>
                    ) : (
                      JSON.stringify(valAfter)
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
