import ProfessionalProfile from '#models/professional_profile'
import Profession from '#models/profession'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Expertise extends BaseModel {
  static table = 'expertises'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare professionId: number | null

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare icon: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Profession)
  declare profession: BelongsTo<typeof Profession>

  @manyToMany(() => ProfessionalProfile, {
    pivotTable: 'professional_expertises',
    pivotForeignKey: 'expertise_id',
  })
  declare professionals: ManyToMany<typeof ProfessionalProfile>
}
