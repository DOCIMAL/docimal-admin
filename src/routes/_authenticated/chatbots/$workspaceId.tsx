import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  ArrowLeft, 
  Bot, 
  Calendar, 
  Settings, 
  History, 
  BarChart3, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react'

import { 
  useAdminChatbot, 
  useAdminChatbotDetailStats,
  useForceUnpublishChatbot
} from '@/api/admin-chatbots.api'
import { TokenUsageChart } from '@/components/admin/chatbots/TokenUsageChart'

import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'

export const Route = createFileRoute('/_authenticated/chatbots/$workspaceId')({
  component: ChatbotDetailPage,
})

function ChatbotDetailPage() {
  const { workspaceId } = Route.useParams()
  const { data: bot, isLoading: isBotLoading } = useAdminChatbot(workspaceId)
  const { data: stats, isLoading: isStatsLoading } = useAdminChatbotDetailStats(workspaceId)
  const { mutate: forceUnpublish } = useForceUnpublishChatbot()

  if (isBotLoading) {
    return (
      <Main className='flex items-center justify-center h-[50vh]'>
        <div className='flex flex-col items-center gap-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
          <p className='text-muted-foreground font-medium'>Loading chatbot details...</p>
        </div>
      </Main>
    )
  }

  if (!bot) {
    return (
      <Main className='flex items-center justify-center h-[50vh]'>
        <div className='text-center'>
          <ShieldAlert className='h-12 w-12 text-destructive mx-auto mb-4' />
          <h2 className='text-2xl font-bold'>Chatbot Not Found</h2>
          <p className='text-muted-foreground mt-2'>The requested chatbot could not be found or you don't have permission to view it.</p>
          <Button variant='outline' className='mt-6' asChild>
            <Link to='/chatbots'><ArrowLeft className='mr-2 h-4 w-4' /> Back to List</Link>
          </Button>
        </div>
      </Main>
    )
  }

  const handleForceUnpublish = () => {
    if (confirm(`Are you sure you want to force unpublish "${bot.name}"?`)) {
      forceUnpublish(bot.workspaceId)
    }
  }

  return (
    <>
      <Header>
        <TopNav links={[
          { title: 'Chatbots', href: '/chatbots', isActive: false },
          { title: bot.name, href: `/chatbots/${workspaceId}`, isActive: true }
        ]} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6'>
          <Button variant='ghost' size='sm' className='-ml-2 mb-4 h-8' asChild>
            <Link to='/chatbots'><ArrowLeft className='mr-2 h-4 w-4' /> Back to Chatbots</Link>
          </Button>
          
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16 border-2'>
                <AvatarImage src={bot.avatarUrl} alt={bot.name} />
                <AvatarFallback><Bot className='h-8 w-8 text-muted-foreground' /></AvatarFallback>
              </Avatar>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <h1 className='text-3xl font-bold tracking-tight'>{bot.name}</h1>
                  {bot.isPublished ? (
                    <Badge variant='default' className='bg-green-100 text-green-700 hover:bg-green-100 border-green-200 uppercase'>✅ Live v{bot.publishedVersion}</Badge>
                  ) : (
                    <Badge variant='secondary' className='bg-slate-100 text-slate-600 hover:bg-slate-100 uppercase'>🔶 Draft</Badge>
                  )}
                </div>
                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                  <span className='flex items-center gap-1'><Settings className='h-3 w-3' /> Model: {bot.defaultModel}</span>
                  <span className='flex items-center gap-1'><Calendar className='h-3 w-3' /> Created: {format(new Date(bot.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
            
            <div className='flex items-center gap-2'>
              <Button variant='outline' onClick={() => window.open(`/chat/${bot.id}`, '_blank')}>
                <ExternalLink className='mr-2 h-4 w-4' />
                Public Page
              </Button>
              {bot.isPublished && (
                <Button variant='destructive' onClick={handleForceUnpublish}>
                  Force Unpublish
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList className='bg-muted/50 p-1 border'>
            <TabsTrigger value='overview' className='data-[state=active]:bg-background'>Overview</TabsTrigger>
            <TabsTrigger value='activity' className='data-[state=active]:bg-background'>Activity & Stats</TabsTrigger>
            <TabsTrigger value='versions' className='data-[state=active]:bg-background'>Versions</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6 outline-none'>
            <div className='grid gap-6 md:grid-cols-3'>
              <Card className='md:col-span-2'>
                <CardHeader>
                  <CardTitle>Configuration Overview</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>LLM Model</span>
                      <p className='font-medium'>{bot.defaultModel}</p>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>Temperature</span>
                      <p className='font-medium'>{bot.temperature}</p>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>Workspace ID</span>
                      <p className='text-sm tabular-nums'>{bot.workspaceId}</p>
                    </div>
                    <div className='space-y-1'>
                      <span className='text-xs font-medium text-muted-foreground uppercase'>Tenant ID</span>
                      <p className='text-sm tabular-nums font-medium'>{bot.tenantId}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className='space-y-1'>
                    <span className='text-xs font-medium text-muted-foreground uppercase'>Status Info</span>
                    <p className='text-sm'>
                      {bot.isPublished 
                        ? `This chatbot is currently live and serving users from version ${bot.publishedVersion}.`
                        : 'This chatbot is currently in draft mode and not accessible to the public.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
                  <CardDescription>Last 30 days totals</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='p-2 bg-blue-100 rounded-lg'><BarChart3 className='h-4 w-4 text-blue-600' /></div>
                      <span className='text-sm font-medium'>Conversations</span>
                    </div>
                    <span className='text-xl font-bold'>{stats?.totalConversations.toLocaleString() || 0}</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='p-2 bg-yellow-100 rounded-lg'><History className='h-4 w-4 text-yellow-600' /></div>
                      <span className='text-sm font-medium'>Tokens Used</span>
                    </div>
                    <span className='text-xl font-bold'>{( (stats?.totalTokens || 0) / 1000).toFixed(1)}k</span>
                  </div>
                  <Separator />
                  <div className='pt-2'>
                    <Button variant='outline' className='w-full' asChild>
                      <Link to='/tenants' params={{ tenantId: bot.tenantId }}>
                        View Tenant Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='activity' className='outline-none'>
            <TokenUsageChart stats={stats} isLoading={isStatsLoading} />
          </TabsContent>

          <TabsContent value='versions' className='outline-none'>
            <Card>
              <CardHeader>
                <CardTitle>Version History</CardTitle>
                <CardDescription>Track changes and audit chatbot stability across revisions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg'>
                  <History className='h-8 w-8 text-muted-foreground mb-4' />
                  <p className='font-medium'>Version comparison coming soon</p>
                  <p className='text-sm text-muted-foreground max-w-xs mt-1'>
                    You will soon be able to compare LLM configurations and system prompts between different published versions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
