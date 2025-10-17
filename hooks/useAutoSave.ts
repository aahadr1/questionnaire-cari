'use client'

import { useEffect, useRef, useCallback } from 'react'
import { FormData } from '@/types/form-builder'

interface UseAutoSaveProps {
  formId?: string
  formData: FormData
  isDirty: boolean
  onSave: () => Promise<void>
  interval?: number
}

export function useAutoSave({
  formId,
  formData,
  isDirty,
  onSave,
  interval = 3000, // 3 seconds
}: UseAutoSaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isSavingRef = useRef(false)

  const save = useCallback(async () => {
    if (!isDirty || isSavingRef.current || !formId) return

    try {
      isSavingRef.current = true
      await onSave()
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isSavingRef.current = false
    }
  }, [formId, isDirty, onSave])

  useEffect(() => {
    if (isDirty && formId) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set new timeout
      timeoutRef.current = setTimeout(save, interval)
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [formData, isDirty, formId, save, interval])

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty && formId && !isSavingRef.current) {
        save()
      }
    }
  }, [isDirty, formId, save])

  return { save }
}
