import { z } from 'zod'

export const AnswerValueSchema = z.any()

export const SubmitSchema = z.object({
  formId: z.string().uuid(),
  responder_name: z.string().min(1).max(200).optional(),
  responder_email: z.string().email().optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        value: AnswerValueSchema,
      })
    )
    .min(1),
})

export type SubmitPayload = z.infer<typeof SubmitSchema>

