import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('normalized_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('msisdn').notNullable().unique()
      table.string('password').notNullable()
      table.enum('gender', ['male', 'female']).notNullable()
      table.dateTime('birthdate').nullable()
      table.string('profile_photo').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
