import vine from '@vinejs/vine'

export const forgotPasswordValidator = vine.compile(
  vine.object({
    msisdn: vine.string().regex(/^\+?[1-9]\d{1,14}$/),
  })
)

