class GetProfessionalsByLocationUseCase {
  constructor({ professionalRepository } = {}) {
    this.professionalRepository = professionalRepository
  }

  async handle(latitude, longitude) {
    const professionals = await this.professionalRepository.getByLocation(
      latitude,
      longitude
    )

    if (professionals) {
      return professionals
    }

    return null
  }
}

module.exports = GetProfessionalsByLocationUseCase
