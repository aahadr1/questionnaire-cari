import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getAuthUser, getAuthUserFromRequest } from '@/lib/supabase/server-auth'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  const user = (await getAuthUserFromRequest(req)) || (await getAuthUser())

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabase()
  const { formId, isPublished } = await req.json()

  // Verify user owns this form
  const { data: form } = await supabase
    .from('forms')
    .select('owner_id')
    .eq('id', formId)
    .single()

  if (!form || form.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Generate a unique slug if publishing for the first time
  let updateData: any = { is_published: isPublished }
  
  if (isPublished) {
    // Check if form already has a slug
    const { data: form } = await supabase
      .from('forms')
      .select('slug')
      .eq('id', formId)
      .single()
    
    if (!form?.slug) {
      // Generate unique slug
      let slug = nanoid(8).toLowerCase()
      let attempts = 0
      
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('forms')
          .select('id')
          .eq('slug', slug)
          .single()
        
        if (!existing) break
        
        slug = nanoid(8).toLowerCase()
        attempts++
      }
      
      updateData.slug = slug
    }
  }

  const { data, error } = await supabase
    .from('forms')
    .update(updateData)
    .eq('id', formId)
    .select('slug')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ slug: data.slug })
}