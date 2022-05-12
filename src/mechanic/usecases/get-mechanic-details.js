class GetMechanicDetailsUseCase {
  constructor({ MechanicRepository } = {}) {
    this.MechanicRepository = MechanicRepository
  }

  async handle(mechanicId) {
    if (!mechanicId) {
      throw new Error('Mechanic id is missing')
    }

    const mechanic = await this.MechanicRepository.getById(mechanicId)

    if (mechanic) {
      return mechanic
    }

    return null
  }
}

module.exports = GetMechanicDetailsUseCase
