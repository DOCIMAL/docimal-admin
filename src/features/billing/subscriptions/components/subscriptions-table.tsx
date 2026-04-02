import { useEffect, useLayoutEffect, useState, useMemo } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import {
  useAdminSubscriptions,
  type AdminSubscription,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from '@/api/billing.api'
import { subscriptionsColumns as columns } from './subscriptions-columns'
import { useSubscriptions } from './subscriptions-provider'

type DataTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function SubscriptionsTable({ search, navigate }: DataTableProps) {
  const { tableRef } = useSubscriptions()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 20 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'plan', searchKey: 'plan', type: 'array' },
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'tenant', searchKey: 'search', type: 'string' },
    ],
  })

  // Build API filter params from table state
  const planFilter = columnFilters.find((f) => f.id === 'plan')
    ?.value as string[] | undefined
  const statusFilter = columnFilters.find((f) => f.id === 'status')
    ?.value as string[] | undefined
  const tenantFilter = columnFilters.find((f) => f.id === 'tenant')
    ?.value as string | undefined

  const apiFilters = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: tenantFilter || undefined,
      plan: planFilter && planFilter.length > 0 ? (planFilter as SubscriptionPlan[]) : undefined,
      status: statusFilter && statusFilter.length > 0 ? (statusFilter as SubscriptionStatus[]) : undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, tenantFilter, planFilter, statusFilter]
  )

  const { data: apiData, isLoading } = useAdminSubscriptions(apiFilters)

  const tableData: AdminSubscription[] = (apiData?.data ?? []) as AdminSubscription[]
  const pageCount = apiData?.meta?.totalPages ?? 1

  const table = useReactTable({
    data: tableData,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Register the table instance to provider context
  useLayoutEffect(() => {
    tableRef.current = table
  })

  useEffect(() => {
    const totalPages = apiData?.meta?.totalPages
    if (!isLoading && typeof totalPages === 'number' && totalPages > 0) {
      ensurePageInRange(totalPages)
    }
  }, [apiData?.meta?.totalPages, isLoading, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Search by tenant name...'
        searchKey='tenant'
        filters={[
          {
            columnId: 'plan',
            title: 'Plan',
            options: [
              { label: 'All Plans', value: '' },
              { label: 'Free', value: 'free' },
              { label: 'Starter', value: 'starter' },
              { label: 'Professional', value: 'professional' },
              { label: 'Enterprise', value: 'enterprise' },
            ],
          },
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'All Status', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Trialing', value: 'trialing' },
              { label: 'Canceled', value: 'canceled' },
              { label: 'Past Due', value: 'past_due' },
            ],
          },
        ]}
      />

      {isLoading ? (
        <div className='space-y-2 rounded-lg border'>
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className='flex gap-4 border-b p-4 last:border-b-0'>
              {[...Array(7)].map((_, colIdx) => (
                <Skeleton key={colIdx} className='h-4 flex-1' />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className='rounded-lg border'>
          <Table className='w-full table-fixed'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={cn(
                          header.getContext().column.columnDef.meta?.className
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.columnDef.meta?.className
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center text-muted-foreground'
                  >
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <DataTablePagination table={table} />
    </div>
  )
}
