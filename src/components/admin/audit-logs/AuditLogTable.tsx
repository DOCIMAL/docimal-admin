import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  User as UserIcon,
  Tag,
  Circle,
} from 'lucide-react'
import { type AuditLog } from '@/api/audit.api'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AuditLogDetail } from './AuditLogDetail'

interface AuditLogTableProps {
  logs: AuditLog[]
  isLoading: boolean
}

export const AuditLogTable = ({ logs, isLoading }: AuditLogTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-destructive/10 text-destructive border-destructive/20 shadow-sm'
      case 'ERROR':
        return 'bg-destructive/5 text-destructive border-destructive/10'
      case 'WARNING':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Circle className='mr-2 h-2 w-2 fill-emerald-500 text-emerald-500' />
        )
      case 'FAILED':
        return (
          <Circle className='mr-2 h-2 w-2 fill-destructive text-destructive' />
        )
      default:
        return (
          <Circle className='mr-2 h-2 w-2 fill-muted-foreground text-muted-foreground' />
        )
    }
  }

  if (isLoading) {
    return (
      <div className='w-full overflow-hidden rounded-xl border bg-muted/25'>
        <div className='flex h-96 items-center justify-center'>
          <div className='flex flex-col items-center'>
            <div className='mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary' />
            <p className='animate-pulse text-sm text-muted-foreground'>
              Fetching audit history...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!logs.length) {
    return (
      <div className='flex w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-muted/25 p-20 text-center'>
        <div className='mb-6 rounded-full bg-muted p-6'>
          <Tag className='h-12 w-12 text-muted-foreground' />
        </div>
        <h3 className='mb-2 text-xl font-semibold text-foreground'>
          No audit logs found
        </h3>
        <p className='max-w-md text-muted-foreground'>
          We couldn't find any activities matching your current filters. Try
          adjusting your search criteria.
        </p>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-xl border bg-muted/25'>
      <Table>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent'>
            <TableHead className='w-12'></TableHead>
            <TableHead className='text-xs font-bold tracking-wider uppercase'>
              Time
            </TableHead>
            <TableHead className='text-xs font-bold tracking-wider uppercase'>
              User
            </TableHead>
            <TableHead className='text-xs font-bold tracking-wider uppercase'>
              Action
            </TableHead>
            <TableHead className='text-xs font-bold tracking-wider uppercase'>
              Resource
            </TableHead>
            <TableHead className='text-xs font-bold tracking-wider uppercase'>
              Tenant
            </TableHead>
            <TableHead className='text-xs font-bold tracking-wider uppercase'>
              Severity
            </TableHead>
            <TableHead className='text-right text-xs font-bold tracking-wider uppercase'>
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const isExpanded = expandedRows.has(log._id)
            return (
              <React.Fragment key={log._id}>
                <TableRow
                  className={`cursor-pointer transition-colors ${isExpanded ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => toggleRow(log._id)}
                >
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className='h-4 w-4 text-primary' />
                    ) : (
                      <ChevronRight className='h-4 w-4 text-muted-foreground' />
                    )}
                  </TableCell>
                  <TableCell className='font-mono text-[11px] whitespace-nowrap'>
                    <div className='flex items-center'>
                      <Clock className='mr-2 h-3 w-3 text-muted-foreground' />
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </div>
                    <div className='mt-0.5 ml-5 text-[10px] text-muted-foreground'>
                      {format(new Date(log.createdAt), 'yyyy-MM-dd')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center'>
                      <UserIcon className='mr-2 h-3.5 w-3.5 text-muted-foreground' />
                      <span
                        className='max-w-[120px] truncate text-sm font-medium'
                        title={log.userId}
                      >
                        {log.userId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className='border-indigo-500/20 bg-indigo-500/5 px-1.5 py-0 font-mono text-[10px] text-indigo-500 italic dark:text-indigo-300'
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className='max-w-[100px] truncate text-xs'>
                      {log.resourceType || log.resource}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className='max-w-[80px] truncate font-mono text-[10px] text-muted-foreground'
                      title={log.tenantId}
                    >
                      {log.tenantId || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant='outline'
                      className={`text-[10px] font-bold tracking-tighter ${getSeverityColor(log.severity)}`}
                    >
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='inline-flex items-center text-[11px] font-medium text-muted-foreground'>
                      {getStatusIcon(log.status)}
                      {log.status.toLowerCase()}
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className='bg-muted/30 hover:bg-muted/30'>
                    <TableCell colSpan={8} className='border-b p-0'>
                      <AuditLogDetail log={log} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
