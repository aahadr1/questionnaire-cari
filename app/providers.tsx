'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { Navbar } from '@/components/ui/Navbar'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </AuthProvider>
  )
}


