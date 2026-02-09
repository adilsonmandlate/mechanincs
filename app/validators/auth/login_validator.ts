import vine from '@vinejs/vine'

export const loginValidator = vine.compile(
  vine.object({
    msisdn: vine.string().regex(/^\+?[1-9]\d{1,14}$/),
    password: vine.string(),
  })
)

