'use client'

import { useEffect } from 'react'

// Automatically reload the page when a route chunk fails to load (404),
// which can happen after a fresh deploy when the client still has an old build in memory.
export function ChunkErrorReload() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const message = String(event?.message || '')
      if (message.includes('Loading chunk') || message.includes('ChunkLoadError')) {
        // eslint-disable-next-line no-console
        console.warn('Detected chunk load error, reloading page...')
        window.location.reload()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event?.reason
      const name = String(reason?.name || '')
      const message = String(reason?.message || '')
      if (name.includes('ChunkLoadError') || message.includes('Loading chunk')) {
        // eslint-disable-next-line no-console
        console.warn('Detected chunk load error (unhandledrejection), reloading page...')
        window.location.reload()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}


