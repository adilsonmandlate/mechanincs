import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ClientInsights extends BaseSchema {
  protected tableName = 'client_insights'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.integer('job_count').notNullable().defaultTo(0)
      table.decimal('avg_rating_given', 3, 2).notNullable().defaultTo(0)

      table.specificType('frequent_issues', 'text[]').notNullable().defaultTo('{}')

      table
        .integer('most_used_profession')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('professions')
        .onDelete('RESTRICT')

      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
