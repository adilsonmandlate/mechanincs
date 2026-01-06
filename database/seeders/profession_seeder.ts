import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Profession from '#models/profession'

export default class extends BaseSeeder {
  async run() {
    const existing = await Profession.findBy('name', 'Mecanico')
    if (!existing) {
      await Profession.create({
        name: 'Mecanico',
        suspended: false,
      })
    }
  }
}
