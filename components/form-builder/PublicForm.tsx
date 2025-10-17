'use client'

import { useState } from 'react'
import { FormRecord, QuestionRecord } from '@/types/form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { QuestionRenderer } from '@/components/questions/QuestionRenderer'

interface PublicFormProps {
  form: FormRecord
  questions: QuestionRecord[]
}

type FormStep = 'identification' | 'questions' | 'success'

export function PublicForm({ form, questions }: PublicFormProps) {
  const isNominative = form.access_mode === 'nominative'
  const [step, setStep] = useState<FormStep>(isNominative ? 'identification' : 'questions')
  
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [responderName, setResponderName] = useState('')
  const [responderEmail, setResponderEmail] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateIdentification = () => {
    const newErrors: Record<string, string> = {}
    if (!responderName.trim()) {
      newErrors.responder_name = 'Le nom est obligatoire'
    }
    if (responderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responderEmail)) {
      newErrors.responder_email = 'Email invalide'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateQuestions = () => {
    const newErrors: Record<string, string> = {}
    
    questions.forEach((question) => {
      if (question.is_required) {
        const answer = answers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && !answer.trim())) {
          newErrors[question.id] = 'Cette question est obligatoire'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateIdentification()) {
      setStep('questions')
      setErrors({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateQuestions()) {
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
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit form')
      }

      setStep('success')
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Erreur lors de l\'envoi du formulaire. Veuillez réessayer.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setStep(isNominative ? 'identification' : 'questions')
    setAnswers({})
    setResponderName('')
    setResponderEmail('')
    setErrors({})
  }

  // Success step
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="mx-auto max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Merci pour votre réponse !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre formulaire a été envoyé avec succès.
            </p>
            <Button
              variant="secondary"
              onClick={handleReset}
            >
              Envoyer une autre réponse
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Identification step (nominative forms only)
  if (step === 'identification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="mx-auto max-w-xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
              {form.description && (
                <p className="text-gray-600">{form.description}</p>
              )}
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Ce formulaire nécessite votre identification. Veuillez renseigner vos informations pour continuer.
              </p>
            </div>

            <form onSubmit={handleStartForm} className="space-y-4">
              <Input
                label="Votre nom"
                value={responderName}
                onChange={(e) => {
                  setResponderName(e.target.value)
                  if (errors.responder_name) {
                    const newErrors = { ...errors }
                    delete newErrors.responder_name
                    setErrors(newErrors)
                  }
                }}
                error={errors.responder_name}
                placeholder="Nom complet"
                required
                autoFocus
              />
              <Input
                label="Votre email (optionnel)"
                type="email"
                value={responderEmail}
                onChange={(e) => {
                  setResponderEmail(e.target.value)
                  if (errors.responder_email) {
                    const newErrors = { ...errors }
                    delete newErrors.responder_email
                    setErrors(newErrors)
                  }
                }}
                error={errors.responder_email}
                placeholder="email@exemple.com"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Commencer le formulaire →
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Questions step
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
              {isNominative && (
                <button
                  onClick={() => setStep('identification')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Retour
                </button>
              )}
            </div>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
            {isNominative && responderName && (
              <div className="mt-3 text-sm text-gray-600">
                Répondant : <span className="font-medium">{responderName}</span>
              </div>
            )}
          </div>

          {/* Questions */}
          <form onSubmit={handleSubmit} className="p-6">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune question dans ce formulaire.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
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
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.submit && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center pt-6 border-t">
              <p className="text-sm text-gray-500">
                {questions.filter(q => q.is_required).length > 0 && (
                  <>Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires</>
                )}
              </p>
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting || questions.length === 0}
                size="lg"
              >
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer mes réponses'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}