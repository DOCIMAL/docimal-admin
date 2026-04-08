import { format } from 'date-fns'
import { CreditCard, Download, Calendar, Info } from 'lucide-react'
import { useTenantSubscription } from '@/api/tenants.api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function TenantSubscriptionTab() {
  const { tenantId } = useParams({ from: '/_authenticated/tenants/$tenantId' })
  const { data: billingInfo, isLoading } = useTenantSubscription(tenantId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  const subscription = billingInfo?.subscription
  const invoices = billingInfo?.invoices || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Current plan details and billing cycle.</CardDescription>
        </CardHeader>
        <CardContent>
          {!subscription ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No active subscription</AlertTitle>
              <AlertDescription>
                This tenant is currently on the Free plan or hasn't initiated a subscription.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Current Plan
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold capitalize">{subscription.plan?.name || 'Starter'}</span>
                  <Badge variant="secondary" className="uppercase">{subscription.status}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Billing Period
                </div>
                <div className="text-lg font-semibold">
                  {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                    <>
                      {format(new Date(subscription.currentPeriodStart), 'MMM dd')} - {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                    </>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  ID (Stripe)
                </div>
                <div className="text-sm font-mono truncate bg-muted p-1 rounded">
                  {subscription.stripeSubscriptionId}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Recent billing transactions for this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">PDF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground uppercase">
                      {invoice.stripeInvoiceId.replace('in_', '')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency.toUpperCase() }).format(invoice.amountPaid)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      {invoice.invoicePdf ? (
                        <Button variant="ghost" size="icon" asChild title="Download PDF">
                          <a href={invoice.invoicePdf} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
