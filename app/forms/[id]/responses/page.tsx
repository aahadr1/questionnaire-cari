'use client'

import Link from 'next/link'
import { ResponseViewer } from '@/components/responses/ResponseViewer'
import { Button } from '@/components/ui/Button'

type Props = { params: { id: string } }

export default function FormResponsesPage({ params }: Props) {
  const { id } = params
  
  return (
    <main className="mx-auto max-w-7xl p-8">
      <div className="mb-6">
        <Link href={`/forms/${id}/edit`}>
          <Button variant="secondary" size="sm">
            ← Retour à l'édition
          </Button>
        </Link>
      </div>
      <ResponseViewer formId={id} />
    </main>
  )
}

