import { Link } from '@tanstack/react-router'
import {
  Globe,
  Monitor,
  Terminal,
  Database,
  ExternalLink,
  User as UserIcon,
  Building,
  Activity,
  FileJson,
  Fingerprint,
  Cpu,
  Zap,
  Info,
} from 'lucide-react'
import { type AuditLog } from '@/api/audit.api'
import { Badge } from '@/components/ui/badge'
import { AuditChangesDiff } from './AuditChangesDiff'

interface AuditLogDetailProps {
  log: AuditLog
}

export const AuditLogDetail = ({ log }: AuditLogDetailProps) => {
  const metadata = log.metadata || {}
  const changes = metadata.changes

  return (
    <div className='animate-in border-t border-border bg-muted/30 p-6 duration-300 fade-in slide-in-from-top-2'>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left Column: Metadata & System Info */}
        <div className='space-y-6'>
          <section>
            <h4 className='mb-3 flex items-center text-sm font-semibold'>
              <Database className='mr-2 h-4 w-4 text-blue-500 dark:text-blue-400' />
              Summary Details
            </h4>
            <div className='grid grid-cols-2 gap-4 text-xs'>
              <div className='rounded-lg border border-border/50 bg-background/50 p-3'>
                <span className='mb-1 flex items-center text-[10px] font-bold tracking-tighter text-muted-foreground uppercase'>
                  <FileJson className='mr-1 h-3 w-3 text-blue-500/70' />
                  Resource Type
                </span>
                <span className='font-medium text-foreground'>
                  {log.resourceType || log.resource}
                </span>
              </div>
              <div className='rounded-lg border border-border/50 bg-background/50 p-3'>
                <span className='mb-1 flex items-center text-[10px] font-bold tracking-tighter text-muted-foreground uppercase'>
                  <Fingerprint className='mr-1 h-3 w-3 text-blue-500/70' />
                  Resource ID
                </span>
                <span
                  className='block truncate font-mono text-[11px] text-foreground'
                  title={log.resourceId}
                >
                  {log.resourceId || 'N/A'}
                </span>
              </div>
              <div className='rounded-lg border border-border/50 bg-background/50 p-3'>
                <span className='mb-1 flex items-center text-[10px] font-bold tracking-tighter text-muted-foreground uppercase'>
                  <Cpu className='mr-1 h-3 w-3 text-indigo-500/70' />
                  Source Service
                </span>
                <Badge
                  variant='outline'
                  className='border-muted-foreground/20 bg-muted text-[10px] text-muted-foreground'
                >
                  {log.source || 'Unknown'}
                </Badge>
              </div>
              <div className='rounded-lg border border-border/50 bg-background/50 p-3'>
                <span className='mb-1 flex items-center text-[10px] font-bold tracking-tighter text-muted-foreground uppercase'>
                  <Building className='mr-1 h-3 w-3 text-slate-500/70' />
                  Tenant Context
                </span>
                <div className='flex items-center font-mono text-[11px] text-foreground'>
                  {log.tenantId || 'System Wide'}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className='mb-3 flex items-center text-sm font-semibold'>
              <Monitor className='mr-2 h-4 w-4 text-emerald-500 dark:text-emerald-400' />
              Client Information
            </h4>
            <div className='space-y-2'>
              <div className='flex items-center rounded-lg border border-border/50 bg-background/50 p-2.5 text-xs'>
                <Globe className='mr-2 h-3.5 w-3.5 text-emerald-500/60' />
                <span className='w-24 text-[10px] font-bold text-muted-foreground uppercase'>
                  IP Address:
                </span>
                <span className='font-mono text-foreground'>
                  {log.ipAddress || 'Unknown'}
                </span>
              </div>
              <div className='flex items-start rounded-lg border border-border/50 bg-background/50 p-2.5 text-xs'>
                <Terminal className='mt-0.5 mr-2 h-3.5 w-3.5 text-emerald-500/60' />
                <span className='w-24 text-[10px] font-bold text-muted-foreground uppercase'>
                  User Agent:
                </span>
                <span className='leading-relaxed text-muted-foreground italic'>
                  {log.userAgent || 'Unknown'}
                </span>
              </div>
            </div>
          </section>

          <section>
            <h4 className='mb-3 flex items-center text-sm font-semibold'>
              <UserIcon className='mr-2 h-4 w-4 text-purple-500 dark:text-purple-400' />
              User Reference
            </h4>
            <Link
              to='/users/$userId'
              params={{ userId: log.userId }}
              className='group flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 transition-colors hover:bg-primary/10'
            >
              <div className='text-xs'>
                <span className='mb-0.5 flex items-center text-[10px] font-bold text-muted-foreground uppercase'>
                  <UserIcon className='mr-1 h-3 w-3 text-purple-500/70' />
                  User ID
                </span>
                <span className='font-mono text-primary transition-colors'>
                  {log.userId}
                </span>
              </div>
              <ExternalLink className='ml-4 h-4 w-4 text-primary opacity-50 transition-all group-hover:opacity-100' />
            </Link>
          </section>
        </div>

        {/* Right Column: Changes/Payload */}
        <div className='space-y-6'>
          <section>
            <h4 className='mb-3 flex items-center justify-between text-sm font-semibold'>
              <span className='flex items-center'>
                <Zap className='mr-2 h-4 w-4 text-rose-500 dark:text-rose-400' />
                Action Description
              </span>
              <Badge
                variant='outline'
                className='border-border font-mono text-[10px] text-muted-foreground'
              >
                {log.action}
              </Badge>
            </h4>
            <div className='flex items-start rounded-xl border border-border/50 bg-background/50 p-4 text-sm leading-relaxed text-muted-foreground italic'>
              <Info className='mt-0.5 mr-3 h-4 w-4 shrink-0 text-rose-500/40' />
              "
              {metadata.description ||
                'No detailed description provided for this action.'}
              "
            </div>
          </section>

          {changes && (
            <section>
              <h4 className='mb-3 flex items-center text-sm font-semibold'>
                <Activity className='mr-2 h-4 w-4 text-rose-500/70' />
                Resource Changes
              </h4>
              <AuditChangesDiff before={changes.before} after={changes.after} />
            </section>
          )}

          {!changes && metadata.details && (
            <section>
              <h4 className='mb-3 flex items-center text-sm font-semibold'>
                <Info className='mr-2 h-4 w-4 text-rose-500/70' />
                Additional Details
              </h4>
              <div className='overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs text-muted-foreground'>
                <pre className='whitespace-pre-wrap'>
                  {typeof metadata.details === 'object'
                    ? JSON.stringify(metadata.details, null, 2)
                    : metadata.details}
                </pre>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
