import { BaseSchema } from '@adonisjs/lucid/schema'

export default class JobEvents extends BaseSchema {
  protected tableName = 'job_events'

  async up() {
    this.schema.raw(`
      DO $$
      BEGIN
        CREATE TYPE job_event_type_enum AS ENUM ('created', 'accepted', 'started', 'completed', 'canceled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .integer('job_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('jobs')
        .onDelete('CASCADE')

      table.specificType('event_type', 'job_event_type_enum').notNullable()

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
    this.schema.raw('DROP TYPE IF EXISTS job_event_type_enum')
  }
}
