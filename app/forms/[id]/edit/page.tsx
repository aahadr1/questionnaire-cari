'use client'

import { useEffect, useState } from 'react'
import { FormBuilder } from '@/components/form-builder/FormBuilder'
import { FormData } from '@/types/form-builder'

type Props = { params: { id: string } }

export default function FormEditPage({ params }: Props) {
  const { id } = params
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`/api/forms/${id}`)
        if (!response.ok) throw new Error('Failed to fetch form')
        
        const { form, questions } = await response.json()
        
        const mappedData: FormData = {
          title: form.title || 'Sans titre',
          description: form.description || '',
          accessMode: form.access_mode || 'anonymous',
          identificationFields: form.identification_fields || [],
          questions: questions.map((q: any) => ({
            id: q.id,
            type: q.type,
            label: q.label,
            description: q.description,
            isRequired: q.is_required,
            options: q.options,
            index: q.index,
          })),
          isPublished: form.is_published,
          isActive: form.is_active,
          slug: form.slug,
        }
        
        setFormData(mappedData)
      } catch (err) {
        setError('Erreur lors du chargement du formulaire')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchForm()
  }, [id])

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      </main>
    )
  }

  if (error || !formData) {
    return (
      <main className="mx-auto max-w-7xl p-8">
        <div className="text-red-600">{error || 'Formulaire introuvable'}</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-2xl font-bold mb-6">Édition du formulaire</h1>
      <FormBuilder formId={id} initialData={formData} mode="edit" />
    </main>
  )
}

