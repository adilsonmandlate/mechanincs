import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ProfessionalProfile from '#models/professional_profile'
import { DateTime } from 'luxon'

export default class ProfessionalStat extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare professionalId: number

  @column()
  declare totalJobs: number

  @column()
  declare avgCompletionTime: number

  @column()
  declare responseRate: number

  @column()
  declare acceptanceRate: number

  @column()
  declare cancelRate: number

  @column()
  declare earningsTotal: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ProfessionalProfile)
  declare professional: BelongsTo<typeof ProfessionalProfile>
}
