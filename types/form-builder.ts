import { QuestionType, AccessMode } from './form'

export interface Question {
  id: string
  type: QuestionType
  label: string
  description?: string
  isRequired: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
  index: number
}

export interface FormData {
  title: string
  description: string
  accessMode: AccessMode
  identificationFields: string[]
  questions: Question[]
  isPublished: boolean
  isActive: boolean
  slug?: string
}

export interface FormBuilderState {
  form: FormData
  isDirty: boolean
  isSaving: boolean
  lastSaved?: Date
  errors: Record<string, string>
}

export type FormBuilderAction = 
  | { type: 'SET_FORM'; payload: FormData }
  | { type: 'UPDATE_FORM'; payload: Partial<FormData> }
  | { type: 'ADD_QUESTION'; payload: { type: QuestionType; afterIndex?: number } }
  | { type: 'UPDATE_QUESTION'; payload: { id: string; updates: Partial<Question> } }
  | { type: 'DELETE_QUESTION'; payload: string }
  | { type: 'DUPLICATE_QUESTION'; payload: string }
  | { type: 'REORDER_QUESTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'RESET_DIRTY' }
