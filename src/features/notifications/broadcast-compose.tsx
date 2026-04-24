import { useState, useMemo } from 'react'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useCreateBroadcast } from '@/api/useAdminNotifications'
import { useTenants, type Tenant } from '@/api/tenants.api'
import type { BroadcastAudienceType } from '@/api/notifications.api'

export default function BroadcastComposePage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audienceType, setAudienceType] = useState<BroadcastAudienceType>('all_tenants')
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([])
  const [tenantSearch, setTenantSearch] = useState('')
  const [result, setResult] = useState<{ id: string; recipientCount: number } | null>(null)
  const createBroadcast = useCreateBroadcast()

  const { data: tenantsData, isLoading: tenantsLoading } = useTenants({
    limit: 200,
    status: 'active',
  })

  const filteredTenants = useMemo(() => {
    const tenants = tenantsData?.items ?? []
    if (!tenantSearch.trim()) return tenants
    const q = tenantSearch.toLowerCase()
    return tenants.filter(
      (t: Tenant) =>
        t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q),
    )
  }, [tenantsData?.items, tenantSearch])

  const audienceMismatch =
    audienceType === 'selected_tenants' && selectedTenantIds.length === 0

  const canSubmit =
    title.trim().length > 0 &&
    message.trim().length > 0 &&
    !audienceMismatch &&
    !createBroadcast.isPending

  const toggleTenant = (tenantId: string) => {
    setSelectedTenantIds((prev) =>
      prev.includes(tenantId)
        ? prev.filter((id) => id !== tenantId)
        : [...prev, tenantId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setResult(null)

    try {
      const response = await createBroadcast.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        audienceType,
        ...(audienceType === 'selected_tenants' ? { tenantIds: selectedTenantIds } : {}),
      })

      setResult({ id: response.id, recipientCount: response.recipientCount })
      setTitle('')
      setMessage('')
      setSelectedTenantIds([])
      setAudienceType('all_tenants')
    } catch {
      // Error state handled by createBroadcast.isError
    }
  }

  const selectedTenantNames = useMemo(() => {
    const allTenants = tenantsData?.items ?? []
    return selectedTenantIds
      .map((id) => allTenants.find((t: Tenant) => t.id === id)?.name)
      .filter(Boolean) as string[]
  }, [tenantsData?.items, selectedTenantIds])

  return (
    <>
      <Header>
        <TopNav links={notificationsNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mx-auto max-w-3xl space-y-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Broadcast Notification</h1>
            <p className='text-sm text-muted-foreground'>
              Create a system-wide or tenant-targeted notification for active users.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                Create Broadcast
                <Badge variant='secondary'>Super Admin</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className='space-y-6' onSubmit={handleSubmit}>
                {/* Title */}
                <div className='space-y-2'>
                  <Label htmlFor='broadcast-title'>Title</Label>
                  <Input
                    id='broadcast-title'
                    placeholder='Scheduled Maintenance'
                    maxLength={255}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className='text-xs text-muted-foreground'>{title.length}/255</p>
                </div>

                {/* Message */}
                <div className='space-y-2'>
                  <Label htmlFor='broadcast-message'>Message</Label>
                  <Textarea
                    id='broadcast-message'
                    placeholder='System will be down Saturday 2am-4am UTC.'
                    maxLength={2000}
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <p className='text-xs text-muted-foreground'>{message.length}/2000</p>
                </div>

                {/* Audience Selector */}
                <div className='space-y-3'>
                  <Label>Audience</Label>
                  <RadioGroup
                    value={audienceType}
                    onValueChange={(v) => {
                      setAudienceType(v as BroadcastAudienceType)
                      if (v === 'all_tenants') setSelectedTenantIds([])
                    }}
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='all_tenants' id='audience-all' />
                      <Label htmlFor='audience-all' className='font-normal cursor-pointer'>
                        All Tenants — send to every active user across all tenants
                      </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='selected_tenants' id='audience-selected' />
                      <Label htmlFor='audience-selected' className='font-normal cursor-pointer'>
                        Selected Tenants — send to users in specific tenants only
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Tenant Multi-Select */}
                {audienceType === 'selected_tenants' && (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <Label>Select Tenants</Label>
                      {selectedTenantIds.length > 0 && (
                        <Badge variant='outline'>
                          {selectedTenantIds.length} selected
                        </Badge>
                      )}
                    </div>

                    <Input
                      placeholder='Search tenants...'
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                    />

                    {tenantsLoading ? (
                      <div className='space-y-2'>
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className='h-10 w-full' />
                        ))}
                      </div>
                    ) : filteredTenants.length === 0 ? (
                      <p className='text-sm text-muted-foreground py-4 text-center'>
                        {tenantSearch ? 'No tenants match your search.' : 'No active tenants found.'}
                      </p>
                    ) : (
                      <ScrollArea className='h-[200px] rounded-md border'>
                        <div className='p-2 space-y-1'>
                          {filteredTenants.map((tenant: Tenant) => (
                            <label
                              key={tenant.id}
                              className='flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors'
                            >
                              <Checkbox
                                checked={selectedTenantIds.includes(tenant.id)}
                                onCheckedChange={() => toggleTenant(tenant.id)}
                              />
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-medium truncate'>{tenant.name}</p>
                                <p className='text-xs text-muted-foreground truncate'>
                                  {tenant.slug} · {tenant.userCount} users
                                </p>
                              </div>
                              <Badge variant='outline' className='text-xs shrink-0'>
                                {tenant.plan}
                              </Badge>
                            </label>
                          ))}
                        </div>
                      </ScrollArea>
                    )}

                    {/* Selected tenant summary */}
                    {selectedTenantNames.length > 0 && (
                      <div className='flex flex-wrap gap-1.5'>
                        {selectedTenantNames.map((name) => (
                          <Badge key={name} variant='secondary' className='text-xs'>
                            {name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Validation error for audience mismatch */}
                    {audienceMismatch && (
                      <p className='text-sm text-destructive'>
                        Please select at least one tenant to send the broadcast to.
                      </p>
                    )}
                  </div>
                )}

                {/* Error state */}
                {createBroadcast.isError && (
                  <p className='text-sm text-destructive'>
                    Failed to create broadcast. Please check your permissions and try again.
                  </p>
                )}

                {/* Success state */}
                {result && (
                  <div className='rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950'>
                    <p className='text-sm text-green-800 dark:text-green-200'>
                      Broadcast created successfully. Recipients: {result.recipientCount}
                    </p>
                  </div>
                )}

                <div className='flex justify-end'>
                  <Button type='submit' disabled={!canSubmit}>
                    {createBroadcast.isPending
                      ? 'Sending...'
                      : audienceType === 'all_tenants'
                        ? 'Send to All Tenants'
                        : `Send to ${selectedTenantIds.length} Tenant${selectedTenantIds.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

const notificationsNav = [
  {
    title: 'All Notifications',
    href: '/notifications',
    isActive: false,
  },
  {
    title: 'Broadcast',
    href: '/notifications/broadcast',
    isActive: true,
  },
  {
    title: 'History',
    href: '/notifications/broadcast-history',
    isActive: false,
  },
]
