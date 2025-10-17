'use client'

import { FormBuilder } from '@/components/form-builder/FormBuilder'

export default function NewFormPage() {
  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-2xl font-bold mb-6">Nouveau formulaire</h1>
      <FormBuilder mode="create" />
    </main>
  )
}

