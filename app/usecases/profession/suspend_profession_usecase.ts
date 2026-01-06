import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'

@inject()
export default class SuspendProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ id }: { id: number }) {
    const profession = await this.professionRepository.suspend(id)

    if (!profession) {
      throw new NotFoundException('Profissão não encontrada.')
    }

    return {
      id: profession.id,
      name: profession.name,
      suspended: profession.suspended,
    }
  }
}
