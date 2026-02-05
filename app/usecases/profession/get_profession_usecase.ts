import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'

@inject()
export default class GetProfessionUseCase {
  constructor(private professionRepository: ProfessionRepository) {}

  async execute({ id }: { id: number }) {
    const profession = await this.professionRepository.findByIdOrFail(id)

    return {
      id: profession.id,
      code: profession.code,
      name: profession.name,
    }
  }
}
