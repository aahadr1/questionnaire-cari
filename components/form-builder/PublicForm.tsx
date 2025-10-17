'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FormRecord, QuestionRecord } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { QuestionRenderer } from '@/components/questions/QuestionRenderer'

interface PublicFormProps {
  form: FormRecord
  questions: QuestionRecord[]
}

export function PublicForm({ form, questions }: PublicFormProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [responderName, setResponderName] = useState('')
  const [responderEmail, setResponderEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate responder info if required
    if (form.access_mode === 'nominative' && !responderName.trim()) {
      newErrors.responder_name = 'Le nom est obligatoire'
    }

    // Validate required questions
    questions.forEach((question) => {
      if (question.is_required) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = 'Cette question est obligatoire'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const payload = {
        formId: form.id,
        responder_name: responderName || undefined,
        responder_email: responderEmail || undefined,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
      }

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: 'Erreur lors de l\'envoi du formulaire. Veuillez réessayer.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold text-green-900 mb-2">
            Merci pour votre réponse !
          </h2>
          <p className="text-green-700 mb-6">
            Votre formulaire a été envoyé avec succès.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setSubmitted(false)
              setAnswers({})
              setResponderName('')
              setResponderEmail('')
              setErrors({})
            }}
          >
            Envoyer une autre réponse
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600 mb-6">{form.description}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.access_mode === 'nominative' && (
            <div className="space-y-4 pb-6 border-b">
              <Input
                label="Votre nom"
                value={responderName}
                onChange={(e) => setResponderName(e.target.value)}
                error={errors.responder_name}
                placeholder="Nom complet"
              />
              <Input
                label="Votre email (optionnel)"
                type="email"
                value={responderEmail}
                onChange={(e) => setResponderEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
          )}

          {questions.map((question) => (
            <div key={question.id} className="pb-6 border-b last:border-b-0">
              <QuestionRenderer
                question={question}
                value={answers[question.id]}
                onChange={(value) => {
                  setAnswers({ ...answers, [question.id]: value })
                  // Clear error when user starts typing
                  if (errors[question.id]) {
                    const newErrors = { ...errors }
                    delete newErrors[question.id]
                    setErrors(newErrors)
                  }
                }}
                error={errors[question.id]}
              />
            </div>
          ))}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6">
            <p className="text-sm text-gray-500">
              {questions.filter(q => q.is_required).length > 0 && (
                <>Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires</>
              )}
            </p>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Envoyer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
