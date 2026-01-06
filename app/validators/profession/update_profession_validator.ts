import vine from '@vinejs/vine'

export const updateProfessionValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(255).optional(),
  })
)
