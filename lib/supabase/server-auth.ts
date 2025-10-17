import { cookies, headers } from 'next/headers'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function getAuthUser() {
  const cookieStore = cookies()
  
  // Get access token from cookies
  const allCookies = cookieStore.getAll()
  // Supabase v2 stores a JSON payload in `sb-<project-ref>-auth-token`
  const supabaseAuthCookie = allCookies.find(c => c.name.includes('-auth-token'))
  let accessToken: string | null = null

  if (supabaseAuthCookie?.value) {
    try {
      const parsed = JSON.parse(supabaseAuthCookie.value)
      accessToken = parsed?.access_token || null
    } catch {
      // Fallback: some environments may store raw token (unlikely)
      accessToken = supabaseAuthCookie.value
    }
  }

  if (!accessToken) {
    return null
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    return null
  }

  return user
}

export async function getAuthUserFromRequest(req: NextRequest) {
  // Prefer Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization') || headers().get('authorization')
  let accessToken: string | null = null
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    accessToken = authHeader.slice(7).trim()
  }

  if (!accessToken) {
    // Fallback to cookie parsing
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const supabaseAuthCookie = allCookies.find(c => c.name.includes('-auth-token'))
    if (supabaseAuthCookie?.value) {
      try {
        const parsed = JSON.parse(supabaseAuthCookie.value)
        accessToken = parsed?.access_token || null
      } catch {
        accessToken = supabaseAuthCookie.value
      }
    }
  }

  if (!accessToken) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user) return null
  return user
}
