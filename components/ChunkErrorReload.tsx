'use client'

import { useEffect } from 'react'

// Automatically reload the page when a route chunk fails to load (404),
// which can happen after a fresh deploy when the client still has an old build in memory.
export function ChunkErrorReload() {
  useEffect(() => {
    const reload = (reason: string) => {
      // eslint-disable-next-line no-console
      console.warn('Reloading due to runtime asset error:', reason)
      window.location.reload()
    }

    const handleWindowError = (event: Event | ErrorEvent) => {
      // Resource loading errors dispatch Event with target = HTMLScriptElement/HTMLLinkElement
      const anyEvent = event as any
      const target = anyEvent?.target as (HTMLScriptElement | HTMLLinkElement | null)
      if (target && (target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        const url = (target as HTMLScriptElement).src || (target as HTMLLinkElement).href || ''
        if (url.includes('/_next/static/chunks/') || url.includes('/_next/static/css/')) {
          reload('next static asset 404')
          return
        }
      }

      const message = String((anyEvent?.message as string) || '')
      if (message.includes('Loading chunk') || message.includes('ChunkLoadError')) {
        reload('chunk load error message')
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event?.reason
      const name = String(reason?.name || '')
      const message = String(reason?.message || '')
      if (name.includes('ChunkLoadError') || message.includes('Loading chunk')) {
        reload('unhandledrejection chunk load')
      }
    }

    window.addEventListener('error', handleWindowError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('error', handleWindowError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}


