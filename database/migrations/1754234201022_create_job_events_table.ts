import { BaseSchema } from '@adonisjs/lucid/schema'

export default class JobEvents extends BaseSchema {
  protected tableName = 'job_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('job_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('jobs')
        .onDelete('CASCADE')

      table
        .enu('event_type', ['created', 'accepted', 'started', 'completed', 'canceled'], {
          useNative: true,
          enumName: 'job_event_type_enum',
        })
        .notNullable()

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.jsonb('metadata').nullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
