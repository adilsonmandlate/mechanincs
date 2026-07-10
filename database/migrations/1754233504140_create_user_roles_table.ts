import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UserRoles extends BaseSchema {
  protected tableName = 'user_roles'

  async up() {
    this.schema.raw(`
      DO $$
      BEGIN
        CREATE TYPE user_roles_enum AS ENUM ('client', 'professional', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.specificType('role', 'user_roles_enum').notNullable()

      table.unique(['user_id', 'role'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.raw('DROP TYPE IF EXISTS user_roles_enum')
  }
}
