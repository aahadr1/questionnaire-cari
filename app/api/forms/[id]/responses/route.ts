import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseForAccessToken } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Use anonymous client for public read policies; include access token if present for owner reads
  const cookieStore = cookies()
  const authCookie = cookieStore.getAll().find(c => c.name.includes('-auth-token'))
  let accessToken: string | null = null
  if (authCookie?.value) {
    try { accessToken = JSON.parse(authCookie.value)?.access_token || null } catch { accessToken = authCookie.value }
  }
  const supabase = createServerSupabaseForAccessToken(accessToken)
  const { id: formId } = params
  
  const searchParams = req.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  // Get total count
  const { count } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', formId)

  // Get paginated responses with answers
  const { data: responses, error } = await supabase
    .from('responses')
    .select(`
      *,
      answers (
        question_id,
        value
      )
    `)
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    responses: responses || [],
    total: count || 0,
    page,
    limit,
  })
}
