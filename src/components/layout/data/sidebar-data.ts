import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  Building2,
  CreditCard,
  Bot,
  Cpu,
  Plug,
  FileText,
  ScrollText,
  Activity,
  Shield,
  KeyRound,
  ToggleLeft,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@docimal.com',
    avatar: '/images/logo-sm.png',
  },
  teams: [
    {
      name: 'Docimal Admin',
      logo: '/images/logo.png', // Replace with your own logo image
      plan: 'Site Administration',
    },
  ],
  navGroups: [
    {
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        {
          title: 'Tenants',
          url: '/tenants',
          icon: Building2,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Billing',
          icon: CreditCard,
          items: [
            { title: 'Subscriptions', url: '/billing/subscriptions' },
            { title: 'Invoices', url: '/billing/invoices' },
            { title: 'Plans', url: '/billing/plans' },
          ],
        },
      ],
    },
    {
      title: 'Platform',
      items: [
        { title: 'Chatbots', url: '/chatbots', icon: Bot },
        { title: 'AI Models', url: '/ai-models', icon: Cpu },
        { title: 'Integrations', url: '/integrations', icon: Plug },
        { title: 'Documents', url: '/documents', icon: FileText },
      ],
    },
    {
      title: 'System',
      items: [
        { title: 'Audit Logs', url: '/audit-logs', icon: ScrollText },
        { title: 'Notifications', url: '/notifications', icon: Bell },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            { title: 'General', url: '/settings', icon: UserCog },
            {
              title: 'Feature Flags',
              url: '/settings/feature-flags',
              icon: ToggleLeft,
            },
            { title: 'Security', url: '/settings/security', icon: Shield },
            {
              title: 'OAuth Providers',
              url: '/settings/oauth',
              icon: KeyRound,
            },
          ],
        },
        { title: 'System Health', url: '/health', icon: Activity },
      ],
    },
    {
      title: 'Template',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
