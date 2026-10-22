import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.raw(`
      ALTER TYPE job_status_enum ADD VALUE IF NOT EXISTS 'awaiting_customer_confirmation';
      ALTER TYPE job_status_enum ADD VALUE IF NOT EXISTS 'completion_disputed';

      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'assigned';
      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'sms_sent';
      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'sms_received';
      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'completion_declared';
      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'customer_confirmed';
      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'completion_disputed';
      ALTER TYPE job_event_type_enum ADD VALUE IF NOT EXISTS 'rated';
    `)

    this.schema.alterTable('jobs', (table) => {
      table.timestamp('completion_declared_at', { useTz: true }).nullable()
      table.timestamp('completed_at', { useTz: true }).nullable()
      table.index(['status', 'created_at'], 'idx_jobs_status_created_at')
    })
  }

  async down() {
    this.schema.alterTable('jobs', (table) => {
      table.dropIndex(['status', 'created_at'], 'idx_jobs_status_created_at')
      table.dropColumn('completion_declared_at')
      table.dropColumn('completed_at')
    })
  }
}
