import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Job from '#models/job'
import User from '#models/user'

export default class SmsMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobId: number

  @column()
  declare professionalId: number | null

  @column()
  declare direction: 'outbound' | 'inbound'

  @column()
  declare source: 'system' | 'provider' | 'simulator'

  @column()
  declare body: string

  @column()
  declare providerMessageId: string | null

  @column()
  declare metadata: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>

  @belongsTo(() => User, { foreignKey: 'professionalId' })
  declare professional: BelongsTo<typeof User>
}
