import vine from '@vinejs/vine'

export const listDemoSmsConversationsValidator = vine.compile(
  vine.object({
    filter: vine.enum(['pending', 'in_progress', 'all'] as const).optional(),
    search: vine.string().trim().maxLength(100).optional(),
  })
)

export const sendDemoSmsMessageValidator = vine.compile(
  vine.object({
    body: vine.string().trim().minLength(1).maxLength(500),
  })
)
