'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function Navbar() {
  const pathname = usePathname()
  
  // Don't show navbar on public form pages
  if (pathname.startsWith('/f/')) {
    return null
  }
  
  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Questionnaire CARI</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                href="/forms"
                className={clsx(
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  pathname.startsWith('/forms')
                    ? 'border-black text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                Mes formulaires
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href="/forms/new"
              className="ml-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              Nouveau formulaire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
