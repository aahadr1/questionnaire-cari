import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const formId = params.id
  const { data: form, error: ferr } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single()
  if (ferr || !form) return NextResponse.json({ error: ferr?.message || 'Not found' }, { status: 404 })
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', formId)
    .order('index')
  return NextResponse.json({ form, questions: questions ?? [] })
}

