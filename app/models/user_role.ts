import User from '#models/user'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UserRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare role: 'client' | 'professional' | 'admin'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
