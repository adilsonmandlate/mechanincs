import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Job from '#models/job'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class JobEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobId: number

  @column()
  declare eventType: 'created' | 'accepted' | 'started' | 'completed' | 'canceled'

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column()
  declare metadata: Record<string, any> | null

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
