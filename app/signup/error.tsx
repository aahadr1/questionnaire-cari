'use client'

import { useEffect } from 'react'

export default function SignupError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Signup page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-red-700 mb-2">Erreur sur la page d'inscription</h1>
          <p className="text-gray-700 mb-4">{error?.message || "Erreur inconnue"}</p>
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
          >
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}


