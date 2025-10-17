'use client'

import { QuestionType } from '@/types/form'
import { Button } from '@/components/ui/Button'

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void
}

const questionTypes: Array<{
  type: QuestionType
  label: string
  description: string
  icon: string
}> = [
  {
    type: 'short_text',
    label: 'Texte court',
    description: 'Réponse en une ligne',
    icon: '📝',
  },
  {
    type: 'long_text',
    label: 'Texte long',
    description: 'Réponse en plusieurs lignes',
    icon: '📄',
  },
  {
    type: 'single_choice',
    label: 'Choix unique',
    description: 'Une seule réponse possible',
    icon: '⭕',
  },
  {
    type: 'multiple_choice',
    label: 'Choix multiple',
    description: 'Plusieurs réponses possibles',
    icon: '☑️',
  },
  {
    type: 'number',
    label: 'Nombre',
    description: 'Réponse numérique',
    icon: '🔢',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Sélection de date',
    icon: '📅',
  },
  {
    type: 'file',
    label: 'Fichier',
    description: 'Upload de fichier',
    icon: '📎',
  },
]

export function QuestionTypeSelector({ onSelect }: QuestionTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
      {questionTypes.map((type) => (
        <Button
          key={type.type}
          variant="secondary"
          className="flex flex-col items-start p-4 h-auto text-left hover:shadow-md transition-shadow"
          onClick={() => onSelect(type.type)}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{type.icon}</span>
            <span className="font-medium">{type.label}</span>
          </div>
          <span className="text-xs text-gray-500">{type.description}</span>
        </Button>
      ))}
    </div>
  )
}
