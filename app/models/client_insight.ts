import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Profession from '#models/profession'
import User from '#models/user'
import { DateTime } from 'luxon'

export default class ClientInsight extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare jobCount: number

  @column()
  declare avgRatingGiven: number

  @column()
  declare frequentIssues: string[]

  @column()
  declare mostUsedProfession: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Profession, { foreignKey: 'mostUsedProfession' })
  declare profession: BelongsTo<typeof Profession>
}
