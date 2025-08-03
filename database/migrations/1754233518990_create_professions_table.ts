import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Professions extends BaseSchema {
  protected tableName = 'professions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable().unique()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
