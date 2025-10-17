'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers'

import { useFormBuilder } from '@/hooks/useFormBuilder'
import { useAutoSave } from '@/hooks/useAutoSave'
import { FormData, Question } from '@/types/form-builder'
import { QuestionType } from '@/types/form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { QuestionEditor } from '@/components/questions/QuestionEditor'
import { QuestionTypeSelector } from '@/components/questions/QuestionTypeSelector'
import { SortableQuestion } from './SortableQuestion'
import { FormPreview } from './FormPreview'

interface FormBuilderProps {
  formId?: string
  initialData?: Partial<FormData>
  mode: 'create' | 'edit'
}

export function FormBuilder({ formId, initialData, mode }: FormBuilderProps) {
  const router = useRouter()
  const [showQuestionSelector, setShowQuestionSelector] = useState(false)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | undefined>()
  const [showPreview, setShowPreview] = useState(false)
  
  const { form, isDirty, isSaving, lastSaved, errors, actions } = useFormBuilder(initialData)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleSave = useCallback(async () => {
    if (!formId && mode === 'edit') return

    actions.setSaving(true)
    try {
      if (mode === 'create') {
        const response = await fetch('/api/forms/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            access_mode: form.accessMode,
            owner_id: undefined,
          }),
        })

        if (!response.ok) throw new Error('Failed to create form')
        
        const { id } = await response.json()
        router.push(`/forms/${id}/edit`)
      } else {
        const payload = {
          form: {
            title: form.title,
            description: form.description,
            access_mode: form.accessMode,
            identification_fields: form.identificationFields,
          },
          questions: form.questions.map(q => ({
            id: q.id,
            index: q.index,
            type: q.type,
            label: q.label,
            description: q.description,
            is_required: q.isRequired,
            options: q.options,
          })),
        }

        const response = await fetch(`/api/forms/${formId}/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) throw new Error('Failed to save form')
        
        actions.setLastSaved(new Date())
      }
    } catch (error) {
      console.error('Save failed:', error)
      actions.setError('save', 'Erreur lors de la sauvegarde')
    } finally {
      actions.setSaving(false)
    }
  }, [formId, mode, form, actions, router])

  useAutoSave({
    formId,
    formData: form,
    isDirty,
    onSave: handleSave,
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = form.questions.findIndex(q => q.id === active.id)
      const newIndex = form.questions.findIndex(q => q.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        actions.reorderQuestions(oldIndex, newIndex)
      }
    }
  }

  const handleAddQuestion = (type: QuestionType) => {
    actions.addQuestion(type, selectedQuestionIndex)
    setShowQuestionSelector(false)
    setSelectedQuestionIndex(undefined)
  }

  const handlePublish = async () => {
    if (!formId) return

    try {
      const response = await fetch('/api/forms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, isPublished: !form.isPublished }),
      })

      if (!response.ok) throw new Error('Failed to publish form')
      
      const { slug } = await response.json()
      actions.updateForm({ isPublished: !form.isPublished, slug })
    } catch (error) {
      console.error('Publish failed:', error)
      actions.setError('publish', 'Erreur lors de la publication')
    }
  }

  const accessModeOptions = [
    { value: 'anonymous', label: 'Anonyme' },
    { value: 'nominative', label: 'Nominatif' },
    { value: 'authenticated', label: 'Authentifié' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="space-y-4">
          <Input
            label="Titre du formulaire"
            value={form.title}
            onChange={(e) => actions.updateForm({ title: e.target.value })}
            placeholder="Sans titre"
            className="text-xl font-semibold"
            error={errors.title}
          />
          
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => actions.updateForm({ description: e.target.value })}
            placeholder="Décrivez votre formulaire..."
            error={errors.description}
          />

          <Select
            label="Mode d'accès"
            value={form.accessMode}
            onChange={(e) => actions.updateForm({ accessMode: e.target.value as any })}
            options={accessModeOptions}
          />

          {form.accessMode === 'nominative' && (
            <div className="p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                Les répondants devront fournir leur nom pour soumettre le formulaire.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions</h2>
          {lastSaved && (
            <p className="text-sm text-gray-500">
              Dernière sauvegarde : {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        {form.questions.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Aucune question pour le moment</p>
            <Button onClick={() => setShowQuestionSelector(true)}>
              Ajouter une question
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={form.questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {form.questions.map((question, index) => (
                  <SortableQuestion key={question.id} id={question.id}>
                    <QuestionEditor
                      question={question}
                      onUpdate={(updates) => actions.updateQuestion(question.id, updates)}
                      onDelete={() => actions.deleteQuestion(question.id)}
                      onDuplicate={() => actions.duplicateQuestion(question.id)}
                    />
                    <div className="flex justify-center -mt-2 relative z-10">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestionIndex(index)
                          setShowQuestionSelector(true)
                        }}
                        className="opacity-0 hover:opacity-100 transition-opacity"
                      >
                        + Insérer une question
                      </Button>
                    </div>
                  </SortableQuestion>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {form.questions.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowQuestionSelector(true)}
              variant="secondary"
            >
              + Ajouter une question
            </Button>
          </div>
        )}
      </div>

      {showQuestionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Choisir un type de question</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowQuestionSelector(false)
                  setSelectedQuestionIndex(undefined)
                }}
              >
                ✕
              </Button>
            </div>
            <QuestionTypeSelector onSelect={handleAddQuestion} />
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-white border-t py-4 mt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => router.push('/forms')}
            >
              {mode === 'create' ? 'Annuler' : 'Retour'}
            </Button>
            
            {mode === 'edit' && (
              <Button
                variant="secondary"
                onClick={() => router.push(`/forms/${formId}/responses`)}
              >
                Voir les réponses
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-sm text-gray-500">Sauvegarde en cours...</span>
            )}
            
            <Button
              variant="secondary"
              onClick={() => setShowPreview(true)}
            >
              👁️ Aperçu
            </Button>
            
            {mode === 'edit' && (
              <>
                {form.isPublished && form.slug && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Lien public :</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      /f/{form.slug}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`)
                      }}
                    >
                      📋
                    </Button>
                  </div>
                )}
                <Button
                  variant={form.isPublished ? 'secondary' : 'primary'}
                  onClick={handlePublish}
                >
                  {form.isPublished ? 'Dépublier' : 'Publier'}
                </Button>
              </>
            )}
            
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={!isDirty && mode === 'edit'}
            >
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>

      {showPreview && (
        <FormPreview form={form} onClose={() => setShowPreview(false)} />
      )}
    </div>
  )
}
