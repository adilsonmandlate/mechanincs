import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ProfessionalProfile from '#models/professional_profile'
import Expertise from '#models/expertise'

export default class Profession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string | null

  @column()
  declare name: string

  @column()
  declare suspended: boolean

  @column.dateTime()
  declare deletedAt?: DateTime

  @hasMany(() => ProfessionalProfile)
  declare professionals: HasMany<typeof ProfessionalProfile>

  @hasMany(() => Expertise)
  declare expertises: HasMany<typeof Expertise>
}
