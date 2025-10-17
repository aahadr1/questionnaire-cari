'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Lazily resolve the client; if env is missing, surface a controlled error state
  const { client, clientError } = useMemo(() => {
    try {
      return { client: getSupabaseClient(), clientError: null as Error | null }
    } catch (e) {
      return { client: null, clientError: e as Error }
    }
  }, [])

  useEffect(() => {
    if (!client) {
      setLoading(false)
      return
    }

    let isMounted = true

    client.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [client])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      if (!client) throw clientError || new Error('Supabase client not available')
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create profile (ignore error if already exists)
      if (data.user) {
        await client.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
        })
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      if (!client) throw clientError || new Error('Supabase client not available')
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    if (!client) return
    await client.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Gracefully degrade if provider isn't mounted for any reason
    return {
      user: null,
      session: null,
      loading: false,
      async signUp() {
        return { error: new Error('Authentication is not available. Please try again later.') }
      },
      async signIn() {
        return { error: new Error('Authentication is not available. Please try again later.') }
      },
      async signOut() {
        return
      },
    }
  }
  return context
}
