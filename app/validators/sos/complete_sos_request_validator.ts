import vine from '@vinejs/vine'
import { completionDisputeReasons } from '#types/assistance'

export const reportCompletionProblemValidator = vine.compile(
  vine.object({
    reason: vine.enum(completionDisputeReasons),
    description: vine.string().trim().minLength(3).maxLength(1000).optional(),
  })
)
