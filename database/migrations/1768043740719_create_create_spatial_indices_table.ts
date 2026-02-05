import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // Create GIST index on professional_profiles.location
      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS idx_professional_profiles_location 
        ON professional_profiles USING GIST (location)
      `)

      // Create GIST index on jobs.location
      await db.rawQuery(`
        CREATE INDEX IF NOT EXISTS idx_jobs_location 
        ON jobs USING GIST (location)
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`DROP INDEX IF EXISTS idx_professional_profiles_location`)
      await db.rawQuery(`DROP INDEX IF EXISTS idx_jobs_location`)
    })
  }
}
