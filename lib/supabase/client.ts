import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  // In production this will render a client-side alert page we added in login/signup
  // Here we still create a dummy client to avoid import-time crashes
}

export const supabase = createClient(url || 'http://localhost:54321', anon || 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

