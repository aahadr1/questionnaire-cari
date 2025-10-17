"use client"
import { useState } from 'react'
import Link from 'next/link'

type Props = { params: { id: string } }

export default function FormSettingsPage({ params }: Props) {
  const { id } = params
  const [accessMode, setAccessMode] = useState<'anonymous'|'nominative'|'authenticated'>('anonymous')
  const [link, setLink] = useState<string | null>(null)

  async function publish() {
    const res = await fetch('/api/forms/publish', { method: 'POST', body: JSON.stringify({ formId: id }) })
    const data = await res.json()
    if (data?.url) setLink(data.url)
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Paramètres du formulaire</h1>
        <Link href={`/forms/${id}/edit`} className="rounded border px-3 py-2">Retour à l’édition</Link>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded border p-4">
          <div className="font-medium">Accès</div>
          <div className="mt-3 flex gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="access" checked={accessMode==='anonymous'} onChange={()=>setAccessMode('anonymous')} />
              <span>Anonyme</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="access" checked={accessMode==='nominative'} onChange={()=>setAccessMode('nominative')} />
              <span>Nominatif (nom/email sans login)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="access" checked={accessMode==='authenticated'} onChange={()=>setAccessMode('authenticated')} />
              <span>Authentifié (login)</span>
            </label>
          </div>
        </section>

        <section className="rounded border p-4">
          <div className="font-medium">Publication</div>
          <button onClick={publish} className="mt-3 rounded bg-black px-4 py-2 text-white">Publier & générer le lien</button>
          {link && (
            <div className="mt-3 rounded border p-3">
              <div className="text-sm">Partagez votre formulaire</div>
              <input readOnly value={link} className="mt-2 w-full rounded border px-3 py-2" />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

