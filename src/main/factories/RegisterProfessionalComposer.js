const RegisterProfessionalUseCase = require('../../professional/usecases/register-professional')
const RegisterProfessionalController = require('../../professional/controllers/RegisterProfessionalController')
const ProfessionalRepository = require('../../professional/repositories/ProfessionalRepository')

class RegisterProfessionalComposer {
  static compose() {
    const professionalRepository = new ProfessionalRepository()
    const registerProfessionalUseCase = new RegisterProfessionalUseCase({
      professionalRepository
    })
    const registerProfessionalController = new RegisterProfessionalController({
      registerProfessionalUseCase
    })
    return registerProfessionalController
  }
}

module.exports = RegisterProfessionalComposer
