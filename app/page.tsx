import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Questionnaire Cari</h1>
      <p className="mt-2 text-gray-700">Créez, partagez et analysez vos formulaires.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard" className="rounded bg-black px-4 py-2 text-white">Aller au dashboard</Link>
        <Link href="/forms/new" className="rounded border px-4 py-2">Nouveau formulaire</Link>
      </div>
    </main>
  )
}

