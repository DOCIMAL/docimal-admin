import { cn } from '@/lib/utils'

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <img
      src='/images/logo.svg'
      alt='Docimal Admin'
      width={24}
      height={24}
      className={cn('size-6', className)}
      {...props}
    />
  )
}
