import vine from '@vinejs/vine'

export const forgotPasswordValidator = vine.compile(
  vine.object({
    identifier: vine.string(), // Can be email or msisdn
  })
)

