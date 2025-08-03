import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ProfessionalStats extends BaseSchema {
  protected tableName = 'professional_stats'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('professional_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('professional_profiles')
        .onDelete('CASCADE')

      table.integer('total_jobs').notNullable().defaultTo(0)
      table.integer('avg_completion_time').notNullable().defaultTo(0) // tempo médio em minutos
      table.integer('response_rate').notNullable().defaultTo(0) // em percentagem
      table.integer('acceptance_rate').notNullable().defaultTo(0) // em percentagem
      table.integer('cancel_rate').notNullable().defaultTo(0) // em percentagem
      table.decimal('earnings_total', 12, 2).notNullable().defaultTo(0)

      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
