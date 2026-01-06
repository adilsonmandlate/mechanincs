import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    identifier: vine.string(), // Can be email or msisdn
    password: vine.string(),
  })
)

