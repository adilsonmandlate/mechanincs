import Profession from '#models/profession'
import ProfessionalStat from '#models/professional_stat'
import User from '#models/user'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class ProfessionalProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare professionId: number

  @column()
  declare education: 'none' | 'primary' | 'secondary' | 'university' | 'master' | 'phd'

  @column()
  declare yearsOfExperience: number

  @column()
  declare about: string | null

  @column()
  declare status: 'free' | 'busy' | 'pending'

  @column()
  declare ratingAvg: number

  @column()
  declare ratingCount: number

  @column()
  declare location: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Profession)
  declare profession: BelongsTo<typeof Profession>

  @hasOne(() => ProfessionalStat)
  declare stats: HasOne<typeof ProfessionalStat>
}
