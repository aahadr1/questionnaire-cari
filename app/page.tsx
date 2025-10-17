'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  const router = useRouter()
  
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-2xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Questionnaire CARI
            </h1>
            <p className="text-xl text-gray-600">
              Créez des formulaires professionnels en quelques minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold mb-2">Rapide</h3>
              <p className="text-sm text-gray-600">
                Créez vos formulaires en quelques clics avec notre interface intuitive
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Analytique</h3>
              <p className="text-sm text-gray-600">
                Visualisez et exportez vos réponses facilement
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Sécurisé</h3>
              <p className="text-sm text-gray-600">
                Vos données sont protégées et restent privées
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              size="lg"
              onClick={() => router.push('/forms/new')}
              className="w-full sm:w-auto"
            >
              Créer un formulaire →
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => router.push('/forms')}
              className="w-full sm:w-auto"
            >
              Mes formulaires
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

