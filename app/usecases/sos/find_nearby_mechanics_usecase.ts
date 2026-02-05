import { inject } from '@adonisjs/core/container'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import type { FindNearbyMechanicsDto } from '#dtos/sos/find_nearby_mechanics_dto'

@inject()
export default class FindNearbyMechanicsUseCase {
  constructor(private professionalProfileRepository: ProfessionalProfileRepository) {}

  async execute({ data }: { data: FindNearbyMechanicsDto }) {
    const radiusKm = data.radius || 10
    const centerPoint = { latitude: data.latitude, longitude: data.longitude }

    const professionals = await this.professionalProfileRepository.findNearby(
      centerPoint,
      radiusKm,
      20
    )

    return professionals
  }
}
