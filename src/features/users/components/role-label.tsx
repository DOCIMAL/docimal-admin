import { Crown, ShieldCheck, User as UserIcon } from 'lucide-react'

export function RoleLabel({ role }: { role: string | undefined | null }) {
  if (!role) return <span className='text-muted-foreground text-sm'>—</span>

  const normalizedRole = role.toLowerCase()
  let icon = <UserIcon className='h-3.5 w-3.5 text-slate-500' />
  let colorClass = 'text-slate-700 dark:text-slate-300'
  let label = normalizedRole.replace('tenant_', '').replace(/_/g, ' ')

  if (normalizedRole.includes('owner')) {
    icon = <Crown className='h-3.5 w-3.5 text-orange-500' />
    colorClass = 'text-orange-700 dark:text-orange-400 font-medium'
  } else if (normalizedRole.includes('admin')) {
    icon = <ShieldCheck className='h-3.5 w-3.5 text-blue-500' />
    colorClass = 'text-blue-700 dark:text-blue-400 font-medium'
  } else if (normalizedRole === 'user' || normalizedRole === 'member') {
    icon = <UserIcon className='h-3.5 w-3.5 text-slate-500' />
    colorClass = 'text-slate-600 dark:text-slate-400'
  }

  return (
    <span className={`inline-flex items-center gap-1.5 capitalize ${colorClass}`}>
      {icon}
      {label}
    </span>
  )
}
