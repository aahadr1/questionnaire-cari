import { cookies } from 'next/headers'
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
