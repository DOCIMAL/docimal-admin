
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getColumns } from './columns'
import { Tenant } from '@/api/tenants.api'
interface TenantDataTableProps {
  data: Tenant[]
  isLoading?: boolean
  onSuspend: (tenant: Tenant) => void
  onActivate: (tenant: Tenant) => void
  onExtend: (tenant: Tenant) => void
  onSort?: (column: string) => void
}

export function TenantDataTable({
  data,
  isLoading,
  onSuspend,
  onActivate,
  onExtend,
  onSort
}: TenantDataTableProps) {
  const table = useReactTable({
    data,
    columns: getColumns(onSuspend, onActivate, onExtend, onSort),
    getCoreRowModel: getCoreRowModel(),
  })


  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={getColumns(onSuspend, onActivate, onExtend).length}
                className='h-24 text-center'
              >
                Loading tenants...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
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
                colSpan={getColumns(onSuspend, onActivate, onExtend).length}
                className='h-24 text-center'
              >
                No tenants found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
