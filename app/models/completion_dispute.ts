import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Job from '#models/job'
import User from '#models/user'
import type { CompletionDisputeReason } from '#types/assistance'

export default class CompletionDispute extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare jobId: number

  @column()
  declare clientId: number

  @column()
  declare professionalId: number

  @column()
  declare reason: CompletionDisputeReason

  @column()
  declare description: string | null

  @column()
  declare status: 'open' | 'resolved'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare resolvedAt: DateTime | null

  @belongsTo(() => Job)
  declare job: BelongsTo<typeof Job>

  @belongsTo(() => User, { foreignKey: 'clientId' })
  declare client: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'professionalId' })
  declare professional: BelongsTo<typeof User>
}
