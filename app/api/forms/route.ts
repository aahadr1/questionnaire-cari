import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getAuthUser, getAuthUserFromRequest } from '@/lib/supabase/server-auth'

export async function GET(req: NextRequest) {
  const user = (await getAuthUserFromRequest(req)) || (await getAuthUser())

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  
  // Get forms owned by this user
  const { data: forms, error: formsError } = await supabase
    .from('forms')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (formsError) {
    return NextResponse.json({ error: formsError.message }, { status: 400 })
  }

  // Get response counts for each form
  const formIds = forms?.map(f => f.id) || []
  const responseCounts: Record<string, number> = {}

  if (formIds.length > 0) {
    const { data: counts } = await supabase
      .from('responses')
      .select('form_id')
      .in('form_id', formIds)

    if (counts) {
      counts.forEach(response => {
        responseCounts[response.form_id] = (responseCounts[response.form_id] || 0) + 1
      })
    }
  }

  return NextResponse.json({ forms, responseCounts })
}
