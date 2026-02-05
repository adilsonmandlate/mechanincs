import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Create expertises table
    this.schema.createTable('expertises', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable().unique()
      table.text('description').nullable()
      table.string('icon').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })

    // Create professional_expertises pivot table
    this.schema.createTable('professional_expertises', (table) => {
      table.increments('id').primary()

      table
        .integer('professional_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('professional_profiles')
        .onDelete('CASCADE')

      table
        .integer('expertise_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('expertises')
        .onDelete('CASCADE')

      table.unique(['professional_id', 'expertise_id'])
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable('professional_expertises')
    this.schema.dropTable('expertises')
  }
}
