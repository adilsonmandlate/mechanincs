import JobEvent from '#models/job_event'
import Rating from '#models/rating'
import Tag from '#models/tag'
import User from '#models/user'
import { BaseModel, column, belongsTo, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import SmsMessage from '#models/sms_message'
import CompletionDispute from '#models/completion_dispute'
import type { JobStatus } from '#types/assistance'

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
  declare status: JobStatus

  @column()
  declare resolved: boolean

  @column.dateTime()
  declare smsSentAt?: DateTime

  @column.dateTime()
  declare confirmedAt?: DateTime

  @column.dateTime()
  declare completionDeclaredAt?: DateTime

  @column.dateTime()
  declare completedAt?: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare client: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'professionalId' })
  declare professional: BelongsTo<typeof User>

  @hasMany(() => JobEvent)
  declare events: HasMany<typeof JobEvent>

  @hasMany(() => Rating)
  declare ratings: HasMany<typeof Rating>

  @hasMany(() => SmsMessage)
  declare smsMessages: HasMany<typeof SmsMessage>

  @hasOne(() => CompletionDispute)
  declare completionDispute: HasOne<typeof CompletionDispute>

  @manyToMany(() => Tag, {
    pivotTable: 'job_tags',
  })
  declare tags: ManyToMany<typeof Tag>
}
