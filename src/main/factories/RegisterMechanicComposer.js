const RegisterMechanicUseCase = require('../../mechanic/usecases/register-mechanic')
const RegisterMechanicController = require('../../mechanic/controllers/RegisterMechanicController')
const MechanicRepository = require('../../mechanic/repositories/MechanicRepository')

class RegisterMechanicComposer {
  static compose() {
    const mechanicRepository = new MechanicRepository()
    const registerMechanicUseCase = new RegisterMechanicUseCase({
      MechanicRepository: mechanicRepository
    })
    const registerMechanicController = new RegisterMechanicController({
      registerMechanicUseCase
    })
    return registerMechanicController
  }
}

module.exports = RegisterMechanicComposer
