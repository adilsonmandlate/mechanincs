import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Profession from '#models/profession'

export default class extends BaseSeeder {
  async run() {
    const existing = await Profession.findBy('code', 'mecanico')

    if (!existing) {
      await Profession.create({
        code: 'mecanico',
        name: 'Mêcanico',
        suspended: false,
      })
    }
  }
}
