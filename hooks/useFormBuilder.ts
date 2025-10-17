'use client'

import { useReducer, useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { FormBuilderState, FormBuilderAction, FormData, Question } from '@/types/form-builder'
import { QuestionType } from '@/types/form'

const initialState: FormBuilderState = {
  form: {
    title: 'Sans titre',
    description: '',
    accessMode: 'anonymous',
    identificationFields: [],
    questions: [],
    isPublished: false,
    isActive: true,
  },
  isDirty: false,
  isSaving: false,
  errors: {},
}

function formBuilderReducer(state: FormBuilderState, action: FormBuilderAction): FormBuilderState {
  switch (action.type) {
    case 'SET_FORM':
      return {
        ...state,
        form: action.payload,
        isDirty: false,
      }

    case 'UPDATE_FORM':
      return {
        ...state,
        form: { ...state.form, ...action.payload },
        isDirty: true,
      }

    case 'ADD_QUESTION': {
      const newQuestion: Question = {
        id: nanoid(),
        type: action.payload.type,
        label: `Question ${state.form.questions.length + 1}`,
        description: '',
        isRequired: false,
        options: action.payload.type === 'single_choice' || action.payload.type === 'multiple_choice' 
          ? ['Option 1', 'Option 2'] 
          : undefined,
        index: state.form.questions.length,
      }

      const questions = [...state.form.questions]
      const insertIndex = action.payload.afterIndex !== undefined 
        ? action.payload.afterIndex + 1 
        : questions.length

      questions.splice(insertIndex, 0, newQuestion)
      
      // Reindex questions
      const reindexedQuestions = questions.map((q, i) => ({ ...q, index: i }))

      return {
        ...state,
        form: { ...state.form, questions: reindexedQuestions },
        isDirty: true,
      }
    }

    case 'UPDATE_QUESTION': {
      const questions = state.form.questions.map(q =>
        q.id === action.payload.id ? { ...q, ...action.payload.updates } : q
      )
      return {
        ...state,
        form: { ...state.form, questions },
        isDirty: true,
      }
    }

    case 'DELETE_QUESTION': {
      const questions = state.form.questions
        .filter(q => q.id !== action.payload)
        .map((q, i) => ({ ...q, index: i }))
      
      return {
        ...state,
        form: { ...state.form, questions },
        isDirty: true,
      }
    }

    case 'DUPLICATE_QUESTION': {
      const questionToDuplicate = state.form.questions.find(q => q.id === action.payload)
      if (!questionToDuplicate) return state

      const newQuestion: Question = {
        ...questionToDuplicate,
        id: nanoid(),
        label: `${questionToDuplicate.label} (copie)`,
      }

      const duplicateIndex = state.form.questions.findIndex(q => q.id === action.payload)
      const questions = [...state.form.questions]
      questions.splice(duplicateIndex + 1, 0, newQuestion)
      
      const reindexedQuestions = questions.map((q, i) => ({ ...q, index: i }))

      return {
        ...state,
        form: { ...state.form, questions: reindexedQuestions },
        isDirty: true,
      }
    }

    case 'REORDER_QUESTIONS': {
      const questions = [...state.form.questions]
      const [removed] = questions.splice(action.payload.fromIndex, 1)
      questions.splice(action.payload.toIndex, 0, removed)
      
      const reindexedQuestions = questions.map((q, i) => ({ ...q, index: i }))

      return {
        ...state,
        form: { ...state.form, questions: reindexedQuestions },
        isDirty: true,
      }
    }

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }

    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload, isDirty: false }

    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.error },
      }

    case 'CLEAR_ERROR': {
      const errors = { ...state.errors }
      delete errors[action.payload]
      return { ...state, errors }
    }

    case 'RESET_DIRTY':
      return { ...state, isDirty: false }

    default:
      return state
  }
}

export function useFormBuilder(initialForm?: Partial<FormData>) {
  const [state, dispatch] = useReducer(formBuilderReducer, {
    ...initialState,
    form: initialForm ? { ...initialState.form, ...initialForm } : initialState.form,
  })

  const setForm = useCallback((form: FormData) => {
    dispatch({ type: 'SET_FORM', payload: form })
  }, [])

  const updateForm = useCallback((updates: Partial<FormData>) => {
    dispatch({ type: 'UPDATE_FORM', payload: updates })
  }, [])

  const addQuestion = useCallback((type: QuestionType, afterIndex?: number) => {
    dispatch({ type: 'ADD_QUESTION', payload: { type, afterIndex } })
  }, [])

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    dispatch({ type: 'UPDATE_QUESTION', payload: { id, updates } })
  }, [])

  const deleteQuestion = useCallback((id: string) => {
    dispatch({ type: 'DELETE_QUESTION', payload: id })
  }, [])

  const duplicateQuestion = useCallback((id: string) => {
    dispatch({ type: 'DUPLICATE_QUESTION', payload: id })
  }, [])

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_QUESTIONS', payload: { fromIndex, toIndex } })
  }, [])

  const setError = useCallback((field: string, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { field, error } })
  }, [])

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field })
  }, [])

  const setSaving = useCallback((isSaving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: isSaving })
  }, [])

  const setLastSaved = useCallback((date: Date) => {
    dispatch({ type: 'SET_LAST_SAVED', payload: date })
  }, [])

  return {
    ...state,
    actions: {
      setForm,
      updateForm,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      duplicateQuestion,
      reorderQuestions,
      setError,
      clearError,
      setSaving,
      setLastSaved,
    },
  }
}
