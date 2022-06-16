class GetProfessionalDetailsUseCase {
  constructor({ professionalRepository } = {}) {
    this.professionalRepository = professionalRepository
  }

  async handle(professionalId) {
    const professional = await this.professionalRepository.getById(
      professionalId
    )

    if (professional) {
      return professional
    }

    return null
  }
}

module.exports = GetProfessionalDetailsUseCase
