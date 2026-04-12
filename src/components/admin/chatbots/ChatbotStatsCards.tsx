import { Bot, CheckCircle2, FileEdit, MessageSquare, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminChatbotStats } from '@/api/admin-chatbots.api'
import { Skeleton } from '@/components/ui/skeleton'

export const ChatbotStatsCards = () => {
  const { data: stats, isLoading } = useAdminChatbotStats()

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6'>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-12' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { 
    totalChatbots, 
    publishedChatbots, 
    draftChatbots, 
    totalConversations, 
    totalTokensUsed 
  } = stats || {
    totalChatbots: 0,
    publishedChatbots: 0,
    draftChatbots: 0,
    totalConversations: 0,
    totalTokensUsed: 0
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Chatbots</CardTitle>
          <Bot className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalChatbots.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Published</CardTitle>
          <CheckCircle2 className='h-4 w-4 text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{publishedChatbots.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Draft</CardTitle>
          <FileEdit className='h-4 w-4 text-orange-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{draftChatbots.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Conversations (30d)</CardTitle>
          <MessageSquare className='h-4 w-4 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{totalConversations.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tokens (30d)</CardTitle>
          <Zap className='h-4 w-4 text-yellow-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{(totalTokensUsed / 1000000).toFixed(1)}M</div>
        </CardContent>
      </Card>
    </div>
  )
}
