import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getAuthUser, getAuthUserFromRequest } from '@/lib/supabase/server-auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Require authenticated creator and verify ownership
  const user = (await getAuthUserFromRequest(req)) || (await getAuthUser())
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
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
  // Verify user owns this form (simple owner check)
  const { data: ownerRow } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', formId)
    .single()

  if (!ownerRow || ownerRow.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
