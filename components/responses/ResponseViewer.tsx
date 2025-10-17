'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { FormRecord, QuestionRecord, ResponseRecord, AnswerRecord } from '@/types/form'

interface ResponseViewerProps {
  formId: string
}

interface ExtendedResponse extends ResponseRecord {
  answers: Array<{
    question_id: string
    value: any
  }>
}

export function ResponseViewer({ formId }: ResponseViewerProps) {
  const [form, setForm] = useState<FormRecord | null>(null)
  const [questions, setQuestions] = useState<QuestionRecord[]>([])
  const [responses, setResponses] = useState<ExtendedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    fetchData()
  }, [formId, page])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch form and questions
      const formRes = await fetch(`/api/forms/${formId}`)
      if (!formRes.ok) throw new Error('Failed to fetch form')
      const { form, questions } = await formRes.json()
      
      setForm(form)
      setQuestions(questions)

      // Fetch responses
      const responsesRes = await fetch(`/api/forms/${formId}/responses?page=${page}&limit=${itemsPerPage}`)
      if (!responsesRes.ok) throw new Error('Failed to fetch responses')
      const { responses, total } = await responsesRes.json()
      
      setResponses(responses)
      setTotalPages(Math.ceil(total / itemsPerPage))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/export`)
      if (!response.ok) throw new Error('Failed to export')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${form?.title || 'responses'}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getAnswerValue = (response: ExtendedResponse, questionId: string) => {
    const answer = response.answers.find(a => a.question_id === questionId)
    if (!answer) return '-'
    
    const question = questions.find(q => q.id === questionId)
    if (!question) return '-'
    
    // Format value based on question type
    if (question.type === 'multiple_choice' && Array.isArray(answer.value)) {
      return answer.value.join(', ')
    }
    
    if (question.type === 'date' && answer.value) {
      return new Date(answer.value).toLocaleDateString('fr-FR')
    }
    
    if (question.type === 'file' && answer.value) {
      return '📎 Fichier attaché'
    }
    
    return answer.value || '-'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des réponses...</div>
      </div>
    )
  }

  if (!form) {
    return <div className="text-red-600">Formulaire introuvable</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <span>{responses.length} réponse{responses.length > 1 ? 's' : ''}</span>
          <span>{questions.length} question{questions.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500">Aucune réponse pour le moment</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {form.access_mode === 'nominative' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                      </>
                    )}
                    {questions.map(question => (
                      <th
                        key={question.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {question.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.map((response) => (
                    <tr key={response.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(response.submitted_at)}
                      </td>
                      {form.access_mode === 'nominative' && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {response.responder_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {response.responder_email || '-'}
                          </td>
                        </>
                      )}
                      {questions.map(question => (
                        <td
                          key={question.id}
                          className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate"
                          title={getAnswerValue(response, question.id)}
                        >
                          {getAnswerValue(response, question.id)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={exportToCSV} variant="secondary">
              📥 Exporter en CSV
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
