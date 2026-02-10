import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('email_verified_at', { useTz: true }).nullable()
      table.timestamp('msisdn_verified_at', { useTz: true }).nullable()
      table.string('email_verification_token').nullable().unique()
      table.string('password_reset_token').nullable().unique()
      table.timestamp('password_reset_expires_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email_verified_at')
      table.dropColumn('msisdn_verified_at')
      table.dropColumn('email_verification_token')
      table.dropColumn('password_reset_token')
      table.dropColumn('password_reset_expires_at')
    })
  }
}
