'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSupabase } from '@/providers/supabase-provider'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            EphemNotes
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/my-post" className="hover:underline">
              My Post
            </Link>
            <Link href="/edit" className="hover:underline">
              Create/Edit
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
