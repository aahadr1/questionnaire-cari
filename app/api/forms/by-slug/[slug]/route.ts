import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createServerSupabase()
  const slug = params.slug
  const { data: form, error: ferr } = await supabase
    .from('forms')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('is_active', true)
    .single()
  if (ferr || !form) return NextResponse.json({ error: ferr?.message || 'Not found' }, { status: 404 })
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('form_id', form.id)
    .order('index')
  return NextResponse.json({ form, questions: questions ?? [] })
}

