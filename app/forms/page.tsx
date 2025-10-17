import Link from 'next/link'

export default function FormsListPage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes formulaires</h1>
        <Link href="/forms/new" className="rounded bg-black px-4 py-2 text-white">Nouveau formulaire</Link>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards; will be fed by DB later */}
        <div className="rounded border p-4">
          <div className="font-medium">Exemple de formulaire</div>
          <div className="mt-2 text-sm text-gray-600">0 réponses</div>
        </div>
      </div>
    </main>
  )
}

