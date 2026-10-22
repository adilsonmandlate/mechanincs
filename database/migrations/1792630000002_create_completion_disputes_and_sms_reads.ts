import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('completion_disputes', (table) => {
      table.increments('id').primary()
      table
        .integer('job_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('jobs')
        .onDelete('CASCADE')
        .unique()
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('professional_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('RESTRICT')
      table.string('reason', 64).notNullable()
      table.text('description').nullable()
      table.string('status', 24).notNullable().defaultTo('open')
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('resolved_at', { useTz: true }).nullable()

      table.index(['status', 'created_at'], 'idx_completion_disputes_status_created_at')
    })

    this.schema.createTable('sms_conversation_reads', (table) => {
      table.bigIncrements('id').primary()
      table
        .integer('job_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('jobs')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.timestamp('last_read_at', { useTz: true }).notNullable()
      table.unique(['job_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable('sms_conversation_reads')
    this.schema.dropTable('completion_disputes')
  }
}
