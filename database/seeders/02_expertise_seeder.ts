import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Expertise from '#models/expertise'
import Profession from '#models/profession'

export default class extends BaseSeeder {
  async run() {
    const profession = await Profession.findBy('code', 'mecanico')
    if (!profession) {
      console.warn('Profession "mecanico" not found. Please run profession_seeder first.')
      return
    }

    const expertises = [
      { name: 'Eletricista Auto', description: 'Especialista em sistemas elétricos automotivos' },
      { name: 'Motor', description: 'Reparação e manutenção de motores' },
      { name: 'Pneus', description: 'Troca e reparação de pneus' },
      { name: 'Transmissão', description: 'Reparação de sistemas de transmissão' },
      { name: 'Suspensão', description: 'Reparação de sistemas de suspensão' },
      { name: 'Ar Condicionado', description: 'Reparação e manutenção de ar condicionado' },
      { name: 'Freios', description: 'Reparação e manutenção de sistemas de freios' },
      { name: 'Bateria', description: 'Troca e manutenção de baterias' },
      { name: 'Diagnóstico Eletrônico', description: 'Diagnóstico de problemas eletrônicos' },
      { name: 'Carroceria', description: 'Reparação de carroceria e lataria' },
    ]

    for (const expertise of expertises) {
      const existing = await Expertise.findBy('name', expertise.name)

      if (!existing) {
        await Expertise.create({
          ...expertise,
          professionId: profession.id,
        })
      }
    }
  }
}
