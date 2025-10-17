import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getAuthUser, getAuthUserFromRequest } from '@/lib/supabase/server-auth'

export async function POST(req: NextRequest) {
  const user = (await getAuthUserFromRequest(req)) || (await getAuthUser())

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  const { title, description, access_mode, team_id, questions } = await req.json()

  const effectiveOwnerId = user.id

  const { data, error } = await supabase
    .from('forms')
    .insert({
      title: title?.trim() || 'Sans titre',
      description: description || null,
      access_mode: access_mode || 'anonymous',
      team_id: team_id || null,
      owner_id: effectiveOwnerId,
    })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  // Insert initial questions if provided
  if (Array.isArray(questions) && questions.length > 0) {
    const rows = questions.map((q: any, idx: number) => ({
      form_id: data.id,
      index: typeof q.index === 'number' ? q.index : idx,
      type: q.type,
      label: q.label || 'Sans titre',
      description: q.description ?? null,
      is_required: !!q.is_required,
      options: Array.isArray(q.options) ? q.options : [],
    }))
    const { error: qErr } = await supabase.from('questions').insert(rows)
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 400 })
  }
  return NextResponse.json({ id: data.id })
}

