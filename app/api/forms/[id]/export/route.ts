import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const formId = params.id
  const { data: questions } = await supabase
    .from('questions')
    .select('id,label')
    .eq('form_id', formId)
    .order('index')

  const { data: responses } = await supabase
    .from('responses')
    .select('id,submitted_at,responder_name,responder_email')
    .eq('form_id', formId)
    .order('submitted_at')

  const { data: answers } = await supabase
    .from('answers')
    .select('response_id,question_id,value')
    .in('response_id', (responses ?? []).map((r) => r.id))

  const cols = ['Responder', 'Email', 'Submitted', ...(questions ?? []).map((q) => q.label)]
  const lines = [cols.join(',')]
  for (const r of responses ?? []) {
    const row: string[] = [r.responder_name ?? '', r.responder_email ?? '', new Date(r.submitted_at).toISOString()]
    for (const q of questions ?? []) {
      const a = answers?.find((x) => x.response_id === r.id && x.question_id === q.id)
      row.push(JSON.stringify(a?.value ?? ''))
    }
    lines.push(row.join(','))
  }
  const csv = lines.join('\n')
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="form-${formId}.csv"`,
    },
  })
}

