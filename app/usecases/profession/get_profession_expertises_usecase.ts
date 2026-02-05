import { inject } from '@adonisjs/core/container'
import { ProfessionRepository } from '#repositories/profession_repository'
import { ExpertiseRepository } from '#repositories/expertise_repository'

@inject()
export default class GetProfessionExpertisesUseCase {
  constructor(
    private professionRepository: ProfessionRepository,
    private expertiseRepository: ExpertiseRepository
  ) {}

  async execute({ professionId }: { professionId: number }) {
    // Verify profession exists
    await this.professionRepository.findByIdOrFail(professionId)

    // Get all expertises for this profession
    const expertises = await this.expertiseRepository.findByProfessionId(professionId)

    return expertises.map((expertise) => ({
      id: expertise.id,
      name: expertise.name,
      description: expertise.description,
      icon: expertise.icon,
    }))
  }
}
