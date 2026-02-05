import vine from '@vinejs/vine'

export const createSosRequestValidator = vine.compile(
  vine.object({
    professionalId: vine.number().positive(),
    problemDescription: vine.string().minLength(10).maxLength(1000),
    location: vine.object({
      latitude: vine.number().min(-90).max(90),
      longitude: vine.number().min(-180).max(180),
    }),
  })
)
