import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS idx_professional_profiles_available
        ON professional_profiles (status, is_verified)
        WHERE deleted_at IS NULL
      `)

      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS idx_jobs_professional_status_created_at
        ON jobs (professional_id, status, created_at DESC)
      `)

      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS idx_jobs_user_status_created_at
        ON jobs (user_id, status, created_at DESC)
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP INDEX IF EXISTS idx_professional_profiles_available')
      await db.rawQuery('DROP INDEX IF EXISTS idx_jobs_professional_status_created_at')
      await db.rawQuery('DROP INDEX IF EXISTS idx_jobs_user_status_created_at')
    })
  }
}
