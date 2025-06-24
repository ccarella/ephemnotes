import { NavBar } from '@/components/NavBar'
import { layout } from '@/lib/design-system'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={layout.page}>
      <NavBar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}