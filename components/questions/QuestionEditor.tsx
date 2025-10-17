'use client'

import { useState } from 'react'
import { Question } from '@/types/form-builder'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { clsx } from 'clsx'

interface QuestionEditorProps {
  question: Question
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onDuplicate: () => void
  isDragging?: boolean
}

export function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  onDuplicate,
  isDragging,
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleAddOption = () => {
    const currentOptions = question.options || []
    onUpdate({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    })
  }

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  const handleDeleteOption = (index: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index)
    onUpdate({ options: newOptions })
  }

  const questionTypeLabels = {
    short_text: '📝 Texte court',
    long_text: '📄 Texte long',
    single_choice: '⭕ Choix unique',
    multiple_choice: '☑️ Choix multiple',
    number: '🔢 Nombre',
    date: '📅 Date',
    file: '📎 Fichier',
  }

  return (
    <div
      className={clsx(
        'border rounded-lg bg-white transition-all',
        isDragging ? 'opacity-50 shadow-lg' : 'shadow-sm hover:shadow-md'
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className={clsx('w-5 h-5 transition-transform', isExpanded && 'rotate-90')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-600">
                {questionTypeLabels[question.type]}
              </span>
              <div className="flex-1">
                <Input
                  autoFocus
                  value={question.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Intitulé de la question"
                  className="font-medium"
                />
              </div>
            </div>

            {isExpanded && (
              <div className="ml-8 space-y-3">
                <Input
                  value={question.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Description (optionnel)"
                  className="text-sm"
                />

                {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Options</div>
                    {(question.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-gray-400 w-4">
                          {question.type === 'single_choice' ? '○' : '□'}
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => handleUpdateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOption(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={handleAddOption}>
                      + Ajouter une option
                    </Button>
                  </div>
                )}

                {question.type === 'number' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      label="Valeur minimum"
                      value={question.validation?.min || ''}
                      onChange={(e) =>
                        onUpdate({
                          validation: {
                            ...question.validation,
                            min: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                    <Input
                      type="number"
                      label="Valeur maximum"
                      value={question.validation?.max || ''}
                      onChange={(e) =>
                        onUpdate({
                          validation: {
                            ...question.validation,
                            max: e.target.value ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <Switch
                    label="Réponse obligatoire"
                    checked={question.isRequired}
                    onChange={(checked) => onUpdate({ isRequired: checked })}
                  />
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onDuplicate}>
                      Dupliquer
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="cursor-move p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
