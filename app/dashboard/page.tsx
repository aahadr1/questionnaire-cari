'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  
  // Redirect to forms page as dashboard is not implemented yet
  useEffect(() => {
    router.push('/forms')
  }, [router])
  
  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Redirection...</div>
      </div>
    </main>
  )
}

