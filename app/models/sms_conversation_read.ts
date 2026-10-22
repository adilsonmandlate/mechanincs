import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Job from '#models/job'
import User from '#models/user'

export default class SmsConversationRead extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobId: number

  @column()
  declare userId: number

  @column.dateTime()
  declare lastReadAt: DateTime

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
