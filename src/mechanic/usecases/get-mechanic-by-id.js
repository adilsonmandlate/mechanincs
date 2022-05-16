class GetMechanicDetailsUseCase {
  constructor({ MechanicRepository } = {}) {
    this.MechanicRepository = MechanicRepository
  }

  async handle(mechanicId) {
    const mechanic = await this.MechanicRepository.getById(mechanicId)

    if (mechanic) {
      return mechanic
    }

    return null
  }
}

module.exports = GetMechanicDetailsUseCase
