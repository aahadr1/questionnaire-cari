import { createClient } from '@supabase/supabase-js'

// Create a singleton Supabase client safely. If env vars are missing,
// we throw a clear error only when attempting to use the client.
let cachedClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (cachedClient) return cachedClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anon) {
    throw new Error(
      'Supabase client misconfigured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.'
    )
  }

  cachedClient = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return cachedClient
}

