import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('expertises', (table) => {
      table
        .integer('profession_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('professions')
        .onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable('expertises', (table) => {
      table.dropForeign(['profession_id'])
      table.dropColumn('profession_id')
    })
  }
}
