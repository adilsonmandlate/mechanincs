import vine from '@vinejs/vine'

export const rateSosRequestValidator = vine.compile(
  vine.object({
    stars: vine.number().min(1).max(5),
    comment: vine.string().trim().minLength(3).maxLength(1000).optional(),
  })
)
