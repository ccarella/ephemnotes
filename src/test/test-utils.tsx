import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import SupabaseProvider from '@/providers/supabase-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import { FarcasterAuthProvider } from '@/contexts/FarcasterAuthContext'

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <FarcasterAuthProvider>{children}</FarcasterAuthProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }