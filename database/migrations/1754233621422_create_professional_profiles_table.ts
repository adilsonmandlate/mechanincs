import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ProfessionalProfiles extends BaseSchema {
  protected tableName = 'professional_profiles'

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
        .integer('profession_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('professions')
        .onDelete('RESTRICT')

      table
        .enu('education', ['none', 'primary', 'secondary', 'university', 'master', 'phd'], {
          useNative: true,
          enumName: 'education_level_enum',
        })
        .notNullable()

      table.integer('years_of_experience').unsigned().notNullable()
      table.text('about').nullable()

      table
        .enu('status', ['free', 'busy', 'pending'], {
          useNative: true,
          enumName: 'professional_status_enum',
        })
        .notNullable()

      table.decimal('rating_avg', 3, 2).notNullable().defaultTo(0)
      table.integer('rating_count').notNullable().defaultTo(0)

      table.string('location').notNullable()

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
