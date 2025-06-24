import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  animate?: boolean
  variant?: 'rectangle' | 'circle' | 'text'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Skeleton({
  className,
  width,
  height,
  animate = true,
  variant = 'rectangle',
  rounded,
}: SkeletonProps) {
  const roundedClass = rounded
    ? `rounded-${rounded}`
    : variant === 'circle'
      ? 'rounded-full'
      : 'rounded'

  return (
    <div
      data-testid="skeleton"
      className={cn('bg-gray-200 dark:bg-gray-700', animate && 'animate-pulse', roundedClass, className)}
      style={{
        width,
        height,
      }}
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
  animate?: boolean
}

export function SkeletonText({ lines = 3, className, animate = true }: SkeletonTextProps) {
  return (
    <div data-testid="skeleton-text" className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-4', index === lines - 1 ? 'w-3/4' : 'w-full')}
          animate={animate}
        />
      ))}
    </div>
  )
}

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
}

export function SkeletonAvatar({ size = 'md', className, animate = true }: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <Skeleton variant="circle" className={cn(sizeClasses[size], className)} animate={animate} />
  )
}

interface SkeletonCardProps {
  showAvatar?: boolean
  lines?: number
  className?: string
  animate?: boolean
}

export function SkeletonCard({
  showAvatar = false,
  lines = 3,
  className,
  animate = true,
}: SkeletonCardProps) {
  return (
    <div data-testid="skeleton-card" className={cn('border rounded-lg p-4', className)}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          {showAvatar && <SkeletonAvatar size="sm" animate={animate} />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" animate={animate} />
            <Skeleton className="h-5 w-1/2" animate={animate} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn('h-4', index === lines - 1 ? 'w-3/4' : 'w-full')}
              animate={animate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
