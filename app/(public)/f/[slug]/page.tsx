import Link from 'next/link'

type Props = { params: { slug: string } }

async function getForm(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/forms/by-slug/${slug}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = params
  const data = await getForm(slug)
  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p>Formulaire introuvable.</p>
        <Link href="/" className="mt-4 inline-block rounded border px-3 py-2">Accueil</Link>
      </main>
    )
  }
  const { form, questions } = data
  const isNominative = form.access_mode === 'nominative'
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">{form.title}</h1>
      <form className="mt-6 space-y-4" action="/api/submit" method="post">
        <input type="hidden" name="formId" value={form.id} />
        {isNominative && (
          <div className="rounded border p-4">
            <label className="text-sm text-gray-700">Votre nom</label>
            <input name="responder_name" className="mt-2 w-full rounded border px-3 py-2" placeholder="Nom" />
          </div>
        )}
        {questions.map((q: any) => (
          <div key={q.id} className="rounded border p-4">
            <label className="text-sm text-gray-700">{q.label}</label>
            <input name={`q_${q.id}`} className="mt-2 w-full rounded border px-3 py-2" placeholder="Votre réponse" />
          </div>
        ))}
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">Envoyer</button>
      </form>
    </main>
  )
}

