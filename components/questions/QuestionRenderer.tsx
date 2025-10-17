'use client'

import { QuestionRecord } from '@/types/form'
import { Input } from '@/components/ui/Input'

interface QuestionRendererProps {
  question: QuestionRecord
  value: any
  onChange: (value: any) => void
  error?: string
}

export function QuestionRenderer({ question, value, onChange, error }: QuestionRendererProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'short_text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Votre réponse"
            error={error}
          />
        )

      case 'long_text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Votre réponse"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[100px] ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500'
            }`}
          />
        )

      case 'single_choice':
        return (
          <div className="space-y-3">
            {(question.options || []).map((option, index) => (
              <label key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-black focus:ring-gray-500"
                />
                <span className="text-sm flex-1">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {(question.options || []).map((option, index) => (
              <label key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || []
                    if (e.target.checked) {
                      onChange([...currentValues, option])
                    } else {
                      onChange(currentValues.filter((v: string) => v !== option))
                    }
                  }}
                  className="h-4 w-4 text-black focus:ring-gray-500 rounded"
                />
                <span className="text-sm flex-1">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            placeholder="Entrez un nombre"
            error={error}
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            error={error}
          />
        )

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  onChange(file)
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {value && (
              <p className="text-sm text-gray-600">
                Fichier sélectionné : {value.name || value}
              </p>
            )}
          </div>
        )

      default:
        return <div>Type de question non supporté</div>
    }
  }

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">
          {question.label}
          {question.is_required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {question.description && (
          <p className="text-sm text-gray-500 mt-1">{question.description}</p>
        )}
      </label>
      {renderInput()}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
