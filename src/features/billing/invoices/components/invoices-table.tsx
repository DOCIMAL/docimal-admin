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
import {
  useAdminInvoices,
  type AdminInvoice,
  type InvoiceStatus,
} from '@/api/billing.api'
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
import { invoicesColumns as columns } from './invoices-columns'
import { useInvoices } from './invoices-provider'

type DataTableProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function InvoicesTable({ search, navigate }: DataTableProps) {
  const { tableRef } = useInvoices()
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
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'tenant', searchKey: 'search', type: 'string' },
    ],
  })

  // Build API filter params from table state
  const statusFilter = columnFilters.find((f) => f.id === 'status')?.value as
    | string[]
    | undefined
  const tenantFilter = columnFilters.find((f) => f.id === 'tenant')?.value as
    | string
    | undefined

  const apiFilters = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: tenantFilter || undefined,
      status:
        statusFilter && statusFilter.length > 0
          ? (statusFilter as InvoiceStatus[])
          : undefined,
    }),
    [pagination.pageIndex, pagination.pageSize, tenantFilter, statusFilter]
  )

  const { data: apiData, isLoading } = useAdminInvoices(apiFilters)

  const tableData: AdminInvoice[] = (apiData?.data ?? []) as AdminInvoice[]
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
        searchPlaceholder='Search invoices by tenant...'
        searchKey='tenant'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: [
              { label: 'All Status', value: '' },
              { label: 'Paid', value: 'paid' },
              { label: 'Open', value: 'open' },
              { label: 'Void', value: 'void' },
              { label: 'Uncollectible', value: 'uncollectible' },
            ],
          },
        ]}
      />
      <div className='rounded-md border bg-card'>
        <Table className='w-full table-fixed'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      header.getContext().column.columnDef.meta?.className
                    )}
                    style={{
                      width: header.column.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, colIdx) => (
                    <TableCell
                      key={colIdx}
                      className={cn(columns[colIdx]?.meta?.className)}
                    >
                      <Skeleton className='h-4 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(cell.column.columnDef.meta?.className)}
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
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
