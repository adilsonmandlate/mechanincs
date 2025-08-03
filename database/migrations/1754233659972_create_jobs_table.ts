import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Jobs extends BaseSchema {
  protected tableName = 'jobs'

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

      table
        .integer('professional_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('photo').nullable()

      table.string('location').notNullable()

      table
        .enu('status', ['open', 'accepted', 'started', 'completed', 'canceled'], {
          useNative: true,
          enumName: 'job_status_enum',
        })
        .notNullable()

      table.boolean('resolved').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
