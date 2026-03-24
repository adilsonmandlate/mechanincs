import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import UserRole from '#models/user_role'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    const email = 'admin@demo.local'
    const msisdn = '258840000000'

    let user = await User.query().where('email', email).orWhere('msisdn', msisdn).first()

    if (!user) {
      const password = await hash.make('Admin123!')
      user = await User.create({
        name: 'Admin Demo',
        email,
        msisdn,
        password,
        gender: 'male',
        emailVerifiedAt: DateTime.now(),
        msisdnVerifiedAt: DateTime.now(),
      })
    }

    await UserRole.firstOrCreate({
      userId: user.id,
      role: 'admin',
    })
  }
}
