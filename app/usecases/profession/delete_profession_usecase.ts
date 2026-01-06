import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'

@inject()
export default class DeleteProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ id }: { id: number }) {
    const deleted = await this.professionRepository.delete(id)

    if (!deleted) {
      throw new NotFoundException('Profissão não encontrada.')
    }

    return {
      message: 'Profissão removida com sucesso.',
    }
  }
}
