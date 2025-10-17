import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/supabase/server-auth'

type SavePayload = {
  form: { title?: string; description?: string; access_mode?: string; identification_fields?: any[] }
  questions: Array<{ id?: string; index: number; type: string; label: string; description?: string; is_required?: boolean; options?: any[] }>
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  const { id } = params
  const payload = (await req.json()) as SavePayload

  // Verify user owns this form
  const { data: form } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!form || form.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update form
  if (payload.form) {
    const { error } = await supabase
      .from('forms')
      .update({
        title: payload.form.title,
        description: payload.form.description,
        access_mode: payload.form.access_mode,
        identification_fields: payload.form.identification_fields ?? [],
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Replace questions: simple strategy (delete then insert)
  if (payload.questions) {
    const { error: delErr } = await supabase.from('questions').delete().eq('form_id', id)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 })
    const rows = payload.questions.map((q) => ({
      form_id: id,
      index: q.index,
      type: q.type,
      label: q.label,
      description: q.description,
      is_required: q.is_required ?? false,
      options: q.options ?? [],
    }))
    const { error: insErr } = await supabase.from('questions').insert(rows)
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

