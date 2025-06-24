import { NavBar } from '@/components/NavBar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <NavBar />
      {children}
    </div>
  )
}
