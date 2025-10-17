'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { clsx } from 'clsx'

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  // Don't show navbar on public form pages and auth pages
  if (pathname.startsWith('/f/') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return null
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <nav className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">Questionnaire CARI</span>
            </Link>
            {user && (
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
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/forms/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Nouveau formulaire
                </Link>
                
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                      {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user.user_metadata?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={async () => {
                            await signOut()
                            setShowUserMenu(false)
                            window.location.href = '/'
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
