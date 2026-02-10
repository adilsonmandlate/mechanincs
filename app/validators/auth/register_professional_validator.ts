import vine from '@vinejs/vine'
import { MOZ_MSISDN_REGEX } from '#utils/msisdn'

export const registerProfessionalValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(255),
    msisdn: vine.string().trim().regex(MOZ_MSISDN_REGEX),
    password: vine.string().minLength(8),
    gender: vine.enum(['male', 'female']),
    birthdate: vine.date().optional(),
    // Professional specific fields
    professionId: vine.number().positive(),
    education: vine.enum(['none', 'primary', 'secondary', 'university', 'master', 'phd']),
    yearsOfExperience: vine.number().min(0),
    about: vine.string().maxLength(1000).optional(),
    location: vine.object({
      latitude: vine.number().min(-90).max(90),
      longitude: vine.number().min(-180).max(180),
    }),
  })
)
