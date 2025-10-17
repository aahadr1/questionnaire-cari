'use client'

import { FormBuilder } from '@/components/form-builder/FormBuilder'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function NewFormPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto max-w-7xl p-8">
        <h1 className="text-2xl font-bold mb-6">Nouveau formulaire</h1>
        <FormBuilder mode="create" />
      </main>
    </ProtectedRoute>
  )
}

