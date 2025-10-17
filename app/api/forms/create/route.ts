import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { title, description, access_mode, team_id } = await req.json()
  // TODO: derive owner_id from session when auth is wired; placeholder owner null
  const { data, error } = await supabase
    .from('forms')
    .insert({ title: title || 'Sans titre', description, access_mode, team_id })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.id })
}

