import vine from '@vinejs/vine'
import { MOZ_MSISDN_REGEX } from '#utils/msisdn'

export const loginValidator = vine.compile(
  vine.object({
    msisdn: vine.string().trim().regex(MOZ_MSISDN_REGEX),
    password: vine.string(),
  })
)
