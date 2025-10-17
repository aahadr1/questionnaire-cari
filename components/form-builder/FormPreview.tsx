'use client'

import { FormData } from '@/types/form-builder'
import { QuestionRenderer } from '@/components/questions/QuestionRenderer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface FormPreviewProps {
  form: FormData
  onClose: () => void
}

export function FormPreview({ form, onClose }: FormPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Aperçu du formulaire</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{form.title || 'Sans titre'}</h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {form.accessMode === 'nominative' && (
              <div className="space-y-4 pb-6 border-b">
                <Input
                  label="Votre nom"
                  placeholder="Nom complet"
                  disabled
                />
                <Input
                  label="Votre email (optionnel)"
                  type="email"
                  placeholder="email@exemple.com"
                  disabled
                />
              </div>
            )}

            {form.questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucune question ajoutée pour le moment
              </div>
            ) : (
              form.questions.map((question) => (
                <div key={question.id} className="pb-6 border-b last:border-b-0">
                  <QuestionRenderer
                    question={{
                      id: question.id,
                      form_id: '',
                      index: question.index,
                      type: question.type,
                      label: question.label,
                      description: question.description || null,
                      is_required: question.isRequired,
                      options: question.options || null,
                      created_at: new Date().toISOString(),
                    }}
                    value=""
                    onChange={() => {}}
                  />
                </div>
              ))
            )}

            <div className="flex justify-between items-center pt-6">
              <p className="text-sm text-gray-500">
                {form.questions.filter(q => q.isRequired).length > 0 && (
                  <>Les champs marqués d'un <span className="text-red-500">*</span> sont obligatoires</>
                )}
              </p>
              <Button disabled>
                Envoyer (aperçu)
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
