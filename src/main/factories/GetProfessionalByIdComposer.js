const GetProfessionalByIdUseCase = require('../../professional/usecases/get-professional-by-id')
const GetProfessionalByIdController = require('../../professional/controllers/GetProfessionalByIdController')
const ProfessionalRepository = require('../../professional/repositories/ProfessionalRepository')

class GetProfessionalByIdComposer {
  static compose() {
    const professionalRepository = new ProfessionalRepository()
    const getProfessionalByIdUseCase = new GetProfessionalByIdUseCase({
      professionalRepository
    })
    const getProfessionalByIdController = new GetProfessionalByIdController({
      getProfessionalByIdUseCase
    })
    return getProfessionalByIdController
  }
}

module.exports = GetProfessionalByIdComposer
