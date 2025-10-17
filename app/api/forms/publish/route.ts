import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid/non-secure'
import { createServerSupabase } from '@/lib/supabase/server'

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8)

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { formId } = await req.json()
  const slug = nanoid()
  const { data, error } = await supabase
    .from('forms')
    .update({ slug, is_published: true })
    .eq('id', formId)
    .select('slug')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/f/${data.slug}`
  return NextResponse.json({ slug: data.slug, url: shareUrl })
}

