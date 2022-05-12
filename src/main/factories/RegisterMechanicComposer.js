const MechanicRepository = require('../../infrasctruture/repositories/MechanicRepository')
const RegisterMechanicUseCase = require('../../mechanic/usecases/register-mechanic')
const RegisterMechanicController = require('../../mechanic/controllers/RegisterMechanicController')

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
