import vine from '@vinejs/vine'

export const createProfessionValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(255),
  })
)
