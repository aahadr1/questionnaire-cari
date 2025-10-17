export type AccessMode = 'anonymous' | 'nominative' | 'authenticated'

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'number'
  | 'date'
  | 'file'

export interface FormRecord {
  id: string
  title: string
  description: string | null
  slug: string | null
  access_mode: AccessMode
  identification_fields: any[] | null
  is_published: boolean
  is_active: boolean
  created_at: string
}

export interface QuestionRecord {
  id: string
  form_id: string
  index: number
  type: QuestionType
  label: string
  description: string | null
  is_required: boolean
  options: any[] | null
  created_at: string
}

export interface ResponseRecord {
  id: string
  form_id: string
  submitted_at: string
  responder_name: string | null
  responder_email: string | null
}

export interface AnswerRecord {
  id: string
  response_id: string
  question_id: string
  value: any
}

