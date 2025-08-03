import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserRole from '#models/user_role'
import Job from '#models/job'
import Rating from '#models/rating'
import Notification from '#models/notification'
import ActivityLog from '#models/activity_log'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'msisdn'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare normalizedName: string

  @column()
  declare email: string

  @column()
  declare msisdn: string

  @column()
  declare password: string

  @column()
  declare gender: 'male' | 'female'

  @column.dateTime()
  declare birthdate?: DateTime

  @column()
  declare profilePhoto?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt?: DateTime

  @hasMany(() => UserRole)
  declare roles: HasMany<typeof UserRole>

  @hasMany(() => Job)
  declare jobs: HasMany<typeof Job>

  @hasMany(() => Rating)
  declare ratings: HasMany<typeof Rating>

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>

  @hasMany(() => ActivityLog)
  declare activityLogs: HasMany<typeof ActivityLog>

  @beforeSave()
  static async normalizeName(user: User) {
    if (user.$dirty.name) {
      user.normalizedName = user.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    }
  }

  @beforeSave()
  static async normalizeEmail(user: User) {
    if (user.$dirty.email) {
      user.email = user.email.toLowerCase().trim()
    }
  }

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    prefix: 'mch_',
  })
}
