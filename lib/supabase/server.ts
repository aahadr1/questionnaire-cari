import { createClient } from '@supabase/supabase-js'

export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Prefer service role for server routes to bypass RLS when needed (safe only on server)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  })
  return supabase
}

export function createServerSupabaseForAccessToken(accessToken: string | null | undefined) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined
  return createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers },
  })
}

