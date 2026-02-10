import vine from '@vinejs/vine'
import { MOZ_MSISDN_REGEX } from '#utils/msisdn'

export const registerClientValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
    msisdn: vine.string().trim().regex(MOZ_MSISDN_REGEX),
    password: vine.string().minLength(8),
    gender: vine.enum(['male', 'female']),
    birthdate: vine.date().optional(),
  })
)
