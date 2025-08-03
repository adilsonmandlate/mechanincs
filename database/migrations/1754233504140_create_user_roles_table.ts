import { BaseSchema } from '@adonisjs/lucid/schema'

export default class UserRoles extends BaseSchema {
  protected tableName = 'user_roles'

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
        .enu('role', ['client', 'professional', 'admin'], {
          useNative: true,
          enumName: 'user_roles_enum',
        })
        .notNullable()

      table.unique(['user_id', 'role'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
