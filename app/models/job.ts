import JobEvent from '#models/job_event'
import Rating from '#models/rating'
import Tag from '#models/tag'
import User from '#models/user'
import { BaseModel, column, belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Job extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare professionalId: number | null

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare photo: string | null

  @column()
  declare location: string

  @column()
  declare status: 'open' | 'accepted' | 'started' | 'completed' | 'canceled'

  @column()
  declare resolved: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare client: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'professional_id' })
  declare professional: BelongsTo<typeof User>

  @hasMany(() => JobEvent)
  declare events: HasMany<typeof JobEvent>

  @hasMany(() => Rating)
  declare ratings: HasMany<typeof Rating>

  @manyToMany(() => Tag, {
    pivotTable: 'job_tags',
  })
  declare tags: ManyToMany<typeof Tag>
}
