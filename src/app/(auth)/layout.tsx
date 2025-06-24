import { presets } from '@/lib/design-system'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={presets.authPage}>
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}