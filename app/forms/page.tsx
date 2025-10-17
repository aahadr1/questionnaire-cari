'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormRecord } from '@/types/form'
import { Button } from '@/components/ui/Button'

export default function FormsListPage() {
  const router = useRouter()
  const [forms, setForms] = useState<FormRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch('/api/forms')
        if (!response.ok) throw new Error('Failed to fetch forms')
        
        const data = await response.json()
        setForms(data.forms || [])
        setResponseCounts(data.responseCounts || {})
      } catch (error) {
        console.error('Error fetching forms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchForms()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Mes formulaires</h1>
        <Button onClick={() => router.push('/forms/new')}>
          + Nouveau formulaire
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des formulaires...</div>
        </div>
      ) : forms.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun formulaire créé
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez par créer votre premier formulaire
          </p>
          <Button onClick={() => router.push('/forms/new')}>
            Créer un formulaire
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/forms/${form.id}/edit`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg truncate flex-1">
                  {form.title}
                </h3>
                {form.is_published && (
                  <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    Publié
                  </span>
                )}
              </div>
              
              {form.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {form.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{responseCounts[form.id] || 0} réponses</span>
                <span>{formatDate(form.created_at)}</span>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/forms/${form.id}/responses`)
                  }}
                >
                  Réponses
                </Button>
                {form.is_published && form.slug && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(`/f/${form.slug}`, '_blank')
                    }}
                  >
                    Voir
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

