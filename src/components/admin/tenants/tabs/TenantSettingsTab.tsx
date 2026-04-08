import { useState } from 'react'
import { Check, Upload, Trash2, Globe, Building, Mail, ShieldCheck } from 'lucide-react'
import { Tenant, useUpdateTenant } from '@/api/tenants.api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface TenantSettingsTabProps {
  tenant: Tenant
}

export function TenantSettingsTab({ tenant }: TenantSettingsTabProps) {
  const [name, setName] = useState(tenant.name)
  const [email, setEmail] = useState(tenant.contactEmail || '')
  
  const { mutate: updateTenant, isPending } = useUpdateTenant(tenant.id)

  const handleSave = () => {
    updateTenant({
      name,
      contactEmail: email,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Update general identity and contact information for this tenant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name" className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5" />
                Organization Name
              </Label>
              <Input 
                id="org-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug" className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Tenant Slug
              </Label>
              <div className="relative">
                <Input 
                  id="org-slug" 
                  value={tenant.slug} 
                  readOnly 
                  className="bg-muted pr-20"
                />
                <Badge variant="secondary" className="absolute right-2 top-1.5 h-6">Locked</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Slug cannot be changed after creation for consistency across system nodes.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email" className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              Contact Email
            </Label>
            <Input 
              id="contact-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="billing@organization.com"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleSave} disabled={isPending || (name === tenant.name && email === (tenant.contactEmail || ''))}>
              {isPending ? 'Saving...' : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding Assets</CardTitle>
          <CardDescription>Custom logos and favicons for the platform white-labeling.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Organization Logo</Label>
              <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-slate-50/50">
                <div className="h-20 w-full flex items-center justify-center border-2 border-dashed rounded-md bg-white overflow-hidden">
                  {tenant.logoUrl ? (
                    <img src={tenant.logoUrl} alt="Logo" className="max-h-16 max-w-full object-contain" />
                  ) : (
                    <div className="text-xs text-muted-foreground italic">No logo uploaded</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Branding upload coming soon')}>
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Upload
                  </Button>
                  {tenant.logoUrl && (
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold">Favicon</Label>
              <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-slate-50/50 text-center">
                 <div className="h-20 w-20 flex items-center justify-center border-2 border-dashed rounded-md bg-white">
                   <div className="text-[10px] text-muted-foreground italic">16x16 / 32x32</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info('Branding upload coming soon')}>
                  <Upload className="mr-2 h-3.5 w-3.5" />
                  Upload
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <ShieldCheck className="h-5 w-5" />
            Infrastructure Settings
          </CardTitle>
          <CardDescription className="text-orange-700/70">Configure node-level limits and feature flags.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-orange-800/80 italic p-4 border border-orange-200 border-dashed rounded">
             Custom feature flags and infrastructure overrides are being migrated to the individual resource pages.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
