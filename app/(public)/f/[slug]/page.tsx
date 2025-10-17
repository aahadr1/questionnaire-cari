import Link from 'next/link'
import { headers } from 'next/headers'
import { PublicForm } from '@/components/form-builder/PublicForm'

type Props = { params: { slug: string } }

async function getForm(slug: string) {
  const h = headers()
  const proto = (h.get('x-forwarded-proto') || 'https').split(',')[0]
  const host = h.get('x-forwarded-host') || h.get('host')
  const baseUrl = `${proto}://${host}`
  const res = await fetch(`${baseUrl}/api/forms/by-slug/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = params
  const data = await getForm(slug)
  
  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Formulaire introuvable
          </h2>
          <p className="text-red-700 mb-6">
            Le formulaire que vous recherchez n'existe pas ou n'est plus disponible.
          </p>
          <Link 
            href="/" 
            className="inline-block rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    )
  }
  
  const { form, questions } = data
  
  return <PublicForm form={form} questions={questions} />
}

