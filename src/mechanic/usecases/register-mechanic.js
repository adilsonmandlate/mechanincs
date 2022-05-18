const Mechanic = require('../domain/Mechanic')

class RegisterMechanicUseCase {
  constructor({ MechanicRepository }) {
    this.MechanicRepository = MechanicRepository
  }

  async handle(mechanicData) {
    const newMechanic = new Mechanic(mechanicData)
    const mechanic = await this.MechanicRepository.add(newMechanic)

    return mechanic
  }
}

module.exports = RegisterMechanicUseCase
