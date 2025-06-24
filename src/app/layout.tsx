import type { Metadata } from 'next'
import './globals.css'
import SupabaseProvider from '@/providers/supabase-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { FarcasterAuthProvider } from '@/contexts/FarcasterAuthContext'
import { ToastProvider } from '@/lib/toast'
import { NetworkStatusProvider } from '@/components/NetworkStatusProvider'
import { FarcasterSplash } from '@/components/FarcasterSplash'

export const metadata: Metadata = {
  title: 'EphemNotes',
  description: 'Share your ephemeral thoughts',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#FAFAF6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SupabaseProvider>
          <AuthProvider>
            <FarcasterAuthProvider>
              <ToastProvider>
                <FarcasterSplash />
                <NetworkStatusProvider />
                {children}
              </ToastProvider>
            </FarcasterAuthProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
