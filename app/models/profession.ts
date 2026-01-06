import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ProfessionalProfile from '#models/professional_profile'

export default class Profession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare suspended: boolean

  @column.dateTime()
  declare deletedAt?: DateTime

  @hasMany(() => ProfessionalProfile)
  declare professionals: HasMany<typeof ProfessionalProfile>
}
