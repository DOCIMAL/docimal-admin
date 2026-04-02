import { Users, TrendingUp, Check, Sparkles } from 'lucide-react'
import type { AdminPlan } from '@/api/billing.api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Detect if this plan matches the "popular" tier from client pricing */
function isPopularPlan(name: string): boolean {
  return name.toLowerCase() === 'professional'
}

function isEnterprisePlan(name: string): boolean {
  return name.toLowerCase() === 'enterprise'
}

interface PlanCardProps {
  plan: AdminPlan
}

export function PlanCard({ plan }: PlanCardProps) {
  const popular = isPopularPlan(plan.name)
  const enterprise = isEnterprisePlan(plan.name)

  const features = Array.isArray(plan.features)
    ? plan.features.filter(Boolean)
    : (plan.description
        ?.split('\n')
        .map((f) => f.trim())
        .filter(Boolean) ?? [])

  // Compute MRR: amount * active subscribers / 12 if yearly
  const mrr =
    plan.interval === 'year'
      ? (plan.amount * plan.activeSubscriptions) / 12
      : plan.amount * plan.activeSubscriptions

  return (
    <Card
      className={`relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ${
        popular
          ? 'border-0 bg-zinc-900 text-white shadow-xl ring-2 shadow-violet-500/10 ring-violet-500 hover:shadow-2xl hover:shadow-violet-500/20'
          : 'border border-border bg-card hover:border-zinc-300 hover:shadow-lg dark:hover:border-zinc-600'
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className='absolute -top-0 left-1/2 z-10 -translate-x-1/2'>
          <span className='inline-flex items-center gap-1 rounded-b-lg bg-violet-500 px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg shadow-violet-500/30'>
            <Sparkles className='h-3 w-3' />
            Popular
          </span>
        </div>
      )}

      <CardHeader className={`space-y-1 ${popular ? 'pt-8' : 'pt-5'} pb-0`}>
        {/* Plan name */}
        <h3
          className={`text-lg font-semibold capitalize ${
            popular ? 'text-white' : ''
          }`}
        >
          {plan.name}
        </h3>

        {/* Description */}
        {features.length > 0 && (
          <p
            className={`text-sm ${
              popular ? 'text-zinc-400' : 'text-muted-foreground'
            }`}
          >
            {features[0]}
          </p>
        )}
      </CardHeader>

      <CardContent className='flex flex-1 flex-col gap-5 px-6 pt-4 pb-6'>
        {/* Price */}
        <div>
          <div className='flex items-baseline gap-1'>
            {enterprise && plan.amount === 0 ? (
              <span
                className={`text-3xl font-bold ${popular ? 'text-white' : ''}`}
              >
                Contact Sales
              </span>
            ) : (
              <>
                <span
                  className={`text-4xl font-bold tabular-nums ${
                    popular ? 'text-white' : ''
                  }`}
                >
                  {formatCurrency(plan.amount, plan.currency)}
                </span>
                <span
                  className={`text-sm ${
                    popular ? 'text-zinc-400' : 'text-muted-foreground'
                  }`}
                >
                  /{plan.interval === 'year' ? 'year' : 'month'}
                </span>
              </>
            )}
          </div>

          {/* Badge for interval */}
          <div className='mt-2'>
            <Badge
              variant='outline'
              className={`text-[10px] font-medium tracking-wide uppercase ${
                popular ? 'border-zinc-700 text-zinc-400' : ''
              }`}
            >
              {plan.interval === 'year' ? 'Annual billing' : 'Monthly billing'}
            </Badge>
            {plan.trialDays && plan.trialDays > 0 && (
              <Badge
                variant='outline'
                className={`ml-1.5 text-[10px] font-medium ${
                  popular
                    ? 'border-violet-700 text-violet-400'
                    : 'border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400'
                }`}
              >
                {plan.trialDays}-day trial
              </Badge>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          className={`grid grid-cols-2 gap-3 rounded-xl p-3 ${
            popular ? 'bg-zinc-800/60' : 'bg-muted/50'
          }`}
        >
          <div className='text-center'>
            <div
              className={`flex items-center justify-center gap-1 text-xs ${
                popular ? 'text-zinc-500' : 'text-muted-foreground'
              }`}
            >
              <Users className='h-3 w-3' />
              Tenants
            </div>
            <p
              className={`text-xl font-bold tabular-nums ${
                popular ? 'text-white' : ''
              }`}
            >
              {plan.activeSubscriptions}
            </p>
          </div>
          <div className='text-center'>
            <div
              className={`flex items-center justify-center gap-1 text-xs ${
                popular ? 'text-zinc-500' : 'text-muted-foreground'
              }`}
            >
              <TrendingUp className='h-3 w-3' />
              MRR
            </div>
            <p
              className={`text-xl font-bold tabular-nums ${
                popular ? 'text-white' : ''
              }`}
            >
              {formatCurrency(mrr, plan.currency)}
            </p>
          </div>
        </div>

        {/* Features (skip the first one since we used it as description) */}
        {features.length > 1 && (
          <div className='flex-1'>
            <p
              className={`mb-2 text-[10px] font-medium tracking-widest uppercase ${
                popular ? 'text-zinc-500' : 'text-muted-foreground'
              }`}
            >
              What&apos;s included
            </p>
            <ul className='space-y-1.5'>
              {features.slice(1, 5).map((f, i) => (
                <li key={i} className='flex items-center gap-2 text-xs'>
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${
                      popular ? 'text-violet-400' : 'text-emerald-500'
                    }`}
                  />
                  <span
                    className={
                      popular ? 'text-zinc-300' : 'text-muted-foreground'
                    }
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PlanCardSkeleton() {
  return (
    <Card className='overflow-hidden rounded-2xl border'>
      <CardHeader className='pt-5 pb-2'>
        <Skeleton className='h-5 w-24' />
        <Skeleton className='mt-1 h-3 w-36' />
      </CardHeader>
      <CardContent className='space-y-4 px-6 pb-6'>
        <Skeleton className='h-10 w-28' />
        <div className='rounded-xl bg-muted/50 p-3'>
          <div className='grid grid-cols-2 gap-3'>
            <Skeleton className='h-12' />
            <Skeleton className='h-12' />
          </div>
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-4/5' />
          <Skeleton className='h-3 w-3/5' />
        </div>
      </CardContent>
    </Card>
  )
}
