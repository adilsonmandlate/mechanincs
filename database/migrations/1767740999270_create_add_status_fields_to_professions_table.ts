import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'professions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('suspended').notNullable().defaultTo(false)
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('suspended')
      table.dropColumn('deleted_at')
    })
  }
}
