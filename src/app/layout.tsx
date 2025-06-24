import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import SupabaseProvider from '@/providers/supabase-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/lib/toast'
import { NetworkStatusProvider } from '@/components/NetworkStatusProvider'
import { FarcasterSplash } from '@/components/FarcasterSplash'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: 'EphemNotes',
  description: 'Share your ephemeral thoughts',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <SupabaseProvider>
          <AuthProvider>
            <ToastProvider>
              <FarcasterSplash />
              <NetworkStatusProvider />
              {children}
            </ToastProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
