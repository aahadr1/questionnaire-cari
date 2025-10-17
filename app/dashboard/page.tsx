import Link from 'next/link'

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/forms/new" className="rounded bg-black px-4 py-2 text-white">Nouveau formulaire</Link>
      </div>
      <div className="mt-6">
        <Link href="/forms" className="rounded border px-4 py-2">Mes formulaires</Link>
      </div>
    </main>
  )
}

