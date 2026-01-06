import vine from '@vinejs/vine'

export const registerClientValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
    email: vine.string().email(),
    msisdn: vine.string().regex(/^\+?[1-9]\d{1,14}$/),
    password: vine.string().minLength(8),
    gender: vine.enum(['male', 'female']),
    birthdate: vine.date().optional(),
  })
)

