import vine from '@vinejs/vine'

export const findNearbyMechanicsValidator = vine.compile(
  vine.object({
    latitude: vine.number().min(-90).max(90),
    longitude: vine.number().min(-180).max(180),
    radius: vine.number().min(1).max(100).optional(),
  })
)
