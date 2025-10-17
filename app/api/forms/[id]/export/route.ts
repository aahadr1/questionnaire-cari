import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const formId = params.id

  // Get form details
  const { data: form } = await supabase
    .from('forms')
    .select('title, access_mode')
    .eq('id', formId)
    .single()

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  // Get questions with type info
  const { data: questions } = await supabase
    .from('questions')
    .select('id, label, type')
    .eq('form_id', formId)
    .order('index')

  // Get responses
  const { data: responses } = await supabase
    .from('responses')
    .select('id, submitted_at, responder_name, responder_email')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })

  // Get answers
  const { data: answers } = await supabase
    .from('answers')
    .select('response_id, question_id, value')
    .in('response_id', (responses ?? []).map((r) => r.id))

  // Build CSV headers
  const headers = ['Date de soumission']
  if (form.access_mode === 'nominative') {
    headers.push('Nom', 'Email')
  }
  headers.push(...(questions ?? []).map((q) => q.label))

  // Helper function to escape CSV values
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    
    let str = String(value)
    
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"'
    }
    
    return str
  }

  // Format value based on question type
  const formatValue = (value: any, questionType: string): string => {
    if (!value) return ''
    
    if (questionType === 'multiple_choice' && Array.isArray(value)) {
      return value.join('; ')
    }
    
    if (questionType === 'date' && value) {
      try {
        return new Date(value).toLocaleDateString('fr-FR')
      } catch {
        return value
      }
    }
    
    if (questionType === 'file' && value) {
      return 'Fichier attaché'
    }
    
    return String(value)
  }

  // Build CSV rows
  const rows = [headers.map(escapeCSV)]
  
  for (const response of responses ?? []) {
    const row: string[] = [
      new Date(response.submitted_at).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    ]
    
    if (form.access_mode === 'nominative') {
      row.push(escapeCSV(response.responder_name), escapeCSV(response.responder_email))
    }
    
    for (const question of questions ?? []) {
      const answer = answers?.find(
        (a) => a.response_id === response.id && a.question_id === question.id
      )
      const formattedValue = formatValue(answer?.value, question.type)
      row.push(escapeCSV(formattedValue))
    }
    
    rows.push(row)
  }

  // Convert to CSV string
  const csv = rows.map(row => row.join(',')).join('\n')
  
  // Generate filename
  const filename = `${form.title.replace(/[^a-z0-9]/gi, '_')}_reponses_${new Date().toISOString().split('T')[0]}.csv`
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

