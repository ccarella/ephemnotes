import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from './Skeleton'

describe('Skeleton', () => {
  it('renders without crashing', () => {
    render(<Skeleton />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('accepts className prop', () => {
    render(<Skeleton className="custom-class" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('custom-class')
  })

  it('accepts width and height props', () => {
    render(<Skeleton width="100px" height="50px" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' })
  })

  it('has animate-pulse class by default', () => {
    render(<Skeleton />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('animate-pulse')
  })

  it('animation can be disabled', () => {
    render(<Skeleton animate={false} />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).not.toHaveClass('animate-pulse')
  })

  it('renders with rounded corners when variant is circle', () => {
    render(<Skeleton variant="circle" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-full')
  })

  it('renders with default rounded corners when variant is rectangle', () => {
    render(<Skeleton variant="rectangle" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded')
  })

  it('renders with custom rounded corners', () => {
    render(<Skeleton rounded="lg" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('rounded-lg')
  })
})

describe('SkeletonText', () => {
  it('renders multiple lines by default', () => {
    render(<SkeletonText />)
    const lines = screen.getAllByTestId('skeleton')
    expect(lines).toHaveLength(3) // default lines
  })

  it('renders custom number of lines', () => {
    render(<SkeletonText lines={5} />)
    const lines = screen.getAllByTestId('skeleton')
    expect(lines).toHaveLength(5)
  })

  it('renders single line when lines is 1', () => {
    render(<SkeletonText lines={1} />)
    const lines = screen.getAllByTestId('skeleton')
    expect(lines).toHaveLength(1)
  })

  it('applies custom className to container', () => {
    render(<SkeletonText className="custom-spacing" />)
    const container = screen.getByTestId('skeleton-text')
    expect(container).toHaveClass('custom-spacing')
  })

  it('last line has reduced width', () => {
    render(<SkeletonText lines={3} />)
    const lines = screen.getAllByTestId('skeleton')
    expect(lines[lines.length - 1]).toHaveClass('w-3/4')
  })
})

describe('SkeletonAvatar', () => {
  it('renders as a circle by default', () => {
    render(<SkeletonAvatar />)
    const avatar = screen.getByTestId('skeleton')
    expect(avatar).toHaveClass('rounded-full')
  })

  it('renders with default size', () => {
    render(<SkeletonAvatar />)
    const avatar = screen.getByTestId('skeleton')
    expect(avatar).toHaveClass('h-10')
    expect(avatar).toHaveClass('w-10')
  })

  it('renders with small size', () => {
    render(<SkeletonAvatar size="sm" />)
    const avatar = screen.getByTestId('skeleton')
    expect(avatar).toHaveClass('h-8')
    expect(avatar).toHaveClass('w-8')
  })

  it('renders with large size', () => {
    render(<SkeletonAvatar size="lg" />)
    const avatar = screen.getByTestId('skeleton')
    expect(avatar).toHaveClass('h-12')
    expect(avatar).toHaveClass('w-12')
  })

  it('accepts custom className', () => {
    render(<SkeletonAvatar className="custom-avatar" />)
    const avatar = screen.getByTestId('skeleton')
    expect(avatar).toHaveClass('custom-avatar')
  })
})

describe('SkeletonCard', () => {
  it('renders card structure with header and content', () => {
    render(<SkeletonCard />)

    const card = screen.getByTestId('skeleton-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('rounded-lg')
  })

  it('renders with avatar when showAvatar is true', () => {
    render(<SkeletonCard showAvatar />)

    const avatars = screen
      .getAllByTestId('skeleton')
      .filter((el) => el.classList.contains('rounded-full'))
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('renders without avatar when showAvatar is false', () => {
    render(<SkeletonCard showAvatar={false} />)

    const avatars = screen
      .getAllByTestId('skeleton')
      .filter((el) => el.classList.contains('rounded-full'))
    expect(avatars).toHaveLength(0)
  })

  it('renders custom number of content lines', () => {
    render(<SkeletonCard lines={5} />)

    // Count skeleton lines excluding header elements
    const allSkeletons = screen.getAllByTestId('skeleton')
    const contentLines = allSkeletons.filter(
      (el) =>
        !el.classList.contains('rounded-full') && el.parentElement?.classList.contains('space-y-2')
    )
    expect(contentLines.length).toBeGreaterThanOrEqual(5)
  })

  it('accepts custom className', () => {
    render(<SkeletonCard className="custom-card" />)
    const card = screen.getByTestId('skeleton-card')
    expect(card).toHaveClass('custom-card')
  })
})
