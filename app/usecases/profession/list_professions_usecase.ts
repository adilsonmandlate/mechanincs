import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'

@inject()
export default class ListProfessionsUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute() {
    const professions = await this.professionRepository.findAll()

    return professions.map((profession) => ({
      id: profession.id,
      code: profession.code,
      name: profession.name,
    }))
  }
}
