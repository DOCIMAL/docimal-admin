import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Tenant, useExtendTrialTenant } from '@/api/tenants.api'

interface ExtendTrialDialogProps {
  tenant: Tenant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExtendTrialDialog({
  tenant,
  open,
  onOpenChange,
}: ExtendTrialDialogProps) {
  const { mutate: extendTrial, isPending } = useExtendTrialTenant()
  const [days, setDays] = useState('14')

  if (!tenant) return null

  const handleExtend = () => {
    const parsedDays = parseInt(days, 10)
    if (isNaN(parsedDays) || parsedDays < 1) return
    
    extendTrial({ id: tenant.id, days: parsedDays }, {
      onSuccess: () => {
        onOpenChange(false)
        setDays('14') // reset
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Extend Trial for {tenant.name}</AlertDialogTitle>
          <AlertDialogDescription>
            Specify the number of days to extend the trial period. This will push back their trial expiration date.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="days">Number of Days</Label>
            <Input 
              id="days" 
              type="number" 
              min="1" 
              value={days} 
              onChange={(e) => setDays(e.target.value)} 
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button 
            onClick={(e) => {
              e.preventDefault()
              handleExtend()
            }} 
            disabled={isPending || !days || parseInt(days) < 1}
          >
            {isPending ? 'Extending...' : 'Extend Trial'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
