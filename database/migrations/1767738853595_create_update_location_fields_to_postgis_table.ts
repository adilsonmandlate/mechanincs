import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE professional_profiles 
        ADD COLUMN IF NOT EXISTS location_new geography(POINT, 4326)
      `)

      await db.rawQuery(`
        ALTER TABLE professional_profiles 
        DROP COLUMN IF EXISTS location
      `)

      await db.rawQuery(`
        ALTER TABLE professional_profiles 
        RENAME COLUMN location_new TO location
      `)

      await db.rawQuery(`
        ALTER TABLE jobs 
        ADD COLUMN IF NOT EXISTS location_new geography(POINT, 4326)
      `)

      await db.rawQuery(`
        ALTER TABLE jobs 
        DROP COLUMN IF EXISTS location
      `)

      await db.rawQuery(`
        ALTER TABLE jobs 
        RENAME COLUMN location_new TO location
      `)
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery(`
        ALTER TABLE professional_profiles 
        DROP COLUMN IF EXISTS location
      `)

      await db.rawQuery(`
        ALTER TABLE professional_profiles 
        ADD COLUMN location VARCHAR(255) NOT NULL DEFAULT ''
      `)

      await db.rawQuery(`
        ALTER TABLE jobs 
        DROP COLUMN IF EXISTS location
      `)

      await db.rawQuery(`
        ALTER TABLE jobs 
        ADD COLUMN location VARCHAR(255) NOT NULL DEFAULT ''
      `)
    })
  }
}
