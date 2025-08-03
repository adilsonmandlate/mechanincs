import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ProfessionalProfile from '#models/professional_profile'

export default class Profession extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @hasMany(() => ProfessionalProfile)
  declare professionals: HasMany<typeof ProfessionalProfile>
}
