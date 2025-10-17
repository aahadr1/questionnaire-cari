import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function getAuthUser() {
  const cookieStore = cookies()
  
  // Get access token from cookies
  const allCookies = cookieStore.getAll()
  const accessToken = allCookies.find(c => c.name.includes('access-token'))?.value ||
                     allCookies.find(c => c.name.includes('auth-token'))?.value

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
