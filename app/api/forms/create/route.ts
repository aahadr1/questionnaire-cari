import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { title, description, access_mode, team_id, owner_id } = await req.json()

  // We require an owner_id due to schema; fallback to a deterministic anonymous owner
  // In production, derive from auth session (e.g., supabase auth) and/or team membership
  const effectiveOwnerId = owner_id || process.env.DEFAULT_OWNER_ID || '00000000-0000-0000-0000-000000000000'

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
  return NextResponse.json({ id: data.id })
}

