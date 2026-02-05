import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'jobs'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('sms_sent_at', { useTz: true }).nullable()
      table.timestamp('confirmed_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sms_sent_at')
      table.dropColumn('confirmed_at')
    })
  }
}
