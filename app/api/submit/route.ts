import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { SubmitSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const contentType = req.headers.get('content-type') || ''

  let formId: string
  let responder_name: string | undefined
  let responder_email: string | undefined
  let answers: Array<{ questionId: string; value: any }>

  if (contentType.includes('application/json')) {
    const parse = SubmitSchema.safeParse(await req.json())
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parse.error.flatten() }, { status: 400 })
    }
    formId = parse.data.formId
    responder_name = parse.data.responder_name
    responder_email = parse.data.responder_email
    // Normalize and assert required value to satisfy TS
    answers = parse.data.answers.map((a): { questionId: string; value: any } => ({
      questionId: a.questionId,
      value: (a as any).value,
    }))
  } else {
    // Accept HTML form submissions (x-www-form-urlencoded or multipart/form-data)
    const fd = await req.formData()
    const fdFormId = fd.get('formId')
    if (!fdFormId || typeof fdFormId !== 'string') {
      return NextResponse.json({ error: 'Missing formId' }, { status: 400 })
    }
    formId = fdFormId
    const name = fd.get('responder_name')
    const email = fd.get('responder_email')
    responder_name = typeof name === 'string' ? name : undefined
    responder_email = typeof email === 'string' ? email : undefined

    // Build answers from fields named q_<questionId>
    const { data: qs, error: qErr } = await supabase
      .from('questions')
      .select('id')
      .eq('form_id', formId)
    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 400 })
    }
    answers = (qs || []).map((q): { questionId: string; value: any } => {
      const field = fd.get(`q_${q.id}`)
      const value = typeof field === 'string' ? field : (field ?? '')
      return { questionId: q.id as string, value }
    })
    const jsonValidation = SubmitSchema.safeParse({ formId, responder_name, responder_email, answers })
    if (!jsonValidation.success) {
      return NextResponse.json({ error: 'Invalid payload', details: jsonValidation.error.flatten() }, { status: 400 })
    }
  }

  const { data: form, error: formErr } = await supabase
    .from('forms')
    .select('id, is_published, is_active, access_mode')
    .eq('id', formId)
    .single()
  if (formErr || !form || !form.is_published || !form.is_active) {
    return NextResponse.json({ error: 'Form unavailable' }, { status: 400 })
  }

  // Fetch valid question IDs for the target form and validate payload
  const { data: validQuestions, error: validQErr } = await supabase
    .from('questions')
    .select('id')
    .eq('form_id', formId)

  if (validQErr) {
    return NextResponse.json({ error: validQErr.message }, { status: 400 })
  }

  const validIds = new Set((validQuestions || []).map((q: any) => String(q.id)))
  const normalizedAnswers = (answers || [])
    .map((a) => ({ questionId: String(a.questionId).trim(), value: a.value }))
    .filter((a) => validIds.has(a.questionId))

  // If no valid answers remain, we'll still record the response without answers

  const { data: response, error: respErr } = await supabase
    .from('responses')
    .insert({ form_id: formId, responder_name, responder_email })
    .select('id')
    .single()
  if (respErr) {
    return NextResponse.json({ error: respErr.message }, { status: 400 })
  }

  if (normalizedAnswers.length > 0) {
    const rows = normalizedAnswers.map((a: any) => ({
      response_id: response.id,
      question_id: a.questionId,
      value: a.value,
    }))
    const { error: ansErr } = await supabase.from('answers').insert(rows)
    if (ansErr) {
      return NextResponse.json({ error: ansErr.message }, { status: 400 })
    }
  }
  return NextResponse.json({ ok: true })
}

