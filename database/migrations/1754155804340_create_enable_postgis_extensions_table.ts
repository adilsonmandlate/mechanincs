import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      await db.rawQuery('CREATE EXTENSION IF NOT EXISTS postgis')
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.rawQuery('DROP EXTENSION IF EXISTS postgis')
    })
  }
}
