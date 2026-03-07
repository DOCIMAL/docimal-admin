import { useSearch } from '@tanstack/react-router'
import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import { DashboardMockup } from './components/dashboard-mockup'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <div className='relative container grid h-svh flex-col items-center justify-center overflow-hidden lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='z-10 bg-background/80 backdrop-blur-sm lg:bg-transparent lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-xl font-medium'>Docimal Admin</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Sign in</h2>
            <p className='text-sm text-muted-foreground'>
              Enter your email and password below <br />
              to log into your account
            </p>
          </div>
          <UserAuthForm redirectTo={redirect} />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            By clicking sign in, you agree to our{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Docimal Policy
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative flex h-full items-center justify-center overflow-hidden bg-muted/30 max-lg:hidden',
          'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_70%)] before:opacity-[0.03]'
        )}
      >
        <DashboardMockup />
      </div>
    </div>
  )
}
