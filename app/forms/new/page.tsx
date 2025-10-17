import Link from 'next/link'

export default function NewFormPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-xl font-semibold">Nouveau formulaire</h1>
      <div className="mt-6 space-y-4">
        <div className="rounded border p-4">
          <div className="text-sm text-gray-600">Question 1</div>
          <input className="mt-2 w-full rounded border px-3 py-2" placeholder="Intitulé de la question" />
          <input className="mt-2 w-full rounded border px-3 py-2" placeholder="Réponse (texte court)" />
          <div className="mt-3 flex gap-2">
            <button className="rounded border px-3 py-1">Supprimer</button>
          </div>
        </div>

        <button className="rounded bg-black px-4 py-2 text-white">Add question</button>

        <div className="flex items-center gap-3">
          <Link href="/forms" className="rounded border px-4 py-2">Annuler</Link>
          <button className="rounded bg-green-600 px-4 py-2 text-white">Terminé</button>
        </div>
      </div>
    </main>
  )
}

