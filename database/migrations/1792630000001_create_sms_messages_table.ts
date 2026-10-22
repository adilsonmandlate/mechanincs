import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sms_messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').primary()
      table
        .integer('job_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('jobs')
        .onDelete('CASCADE')
      table
        .integer('professional_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.string('direction', 16).notNullable()
      table.string('source', 24).notNullable()
      table.text('body').notNullable()
      table.string('provider_message_id', 191).nullable().unique()
      table.jsonb('metadata').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table.index(['job_id', 'created_at'], 'idx_sms_messages_job_created_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
