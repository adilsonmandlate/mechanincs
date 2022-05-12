class RegisterMechanicUseCase {
  constructor({ MechanicRepository }) {
    this.MechanicRepository = MechanicRepository
  }

  async handle(mechanicData) {
    const mechanic = await this.MechanicRepository.add(mechanicData)

    return mechanic
  }
}

module.exports = RegisterMechanicUseCase
