import vine from '@vinejs/vine'

export const confirmUserValidator = vine.compile(
  vine.object({
    token: vine.string(),
  })
)

