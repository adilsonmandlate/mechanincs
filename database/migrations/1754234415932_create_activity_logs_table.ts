import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ActivityLogs extends BaseSchema {
  protected tableName = 'activity_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('action').notNullable()
      table.integer('target_id').nullable()
      table.string('target_type').nullable()
      table.jsonb('metadata').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
