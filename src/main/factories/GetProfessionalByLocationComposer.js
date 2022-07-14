const GetProfessionalByLocationUseCase = require('../../professional/usecases/get-professionals-by-location')
const GetProfessionalByLocationController = require('../../professional/controllers/GetProfessionalByLocationController')
const ProfessionalRepository = require('../../professional/repositories/ProfessionalRepository')

class GetProfessionalByLocationComposer {
  static compose() {
    const professionalRepository = new ProfessionalRepository()
    const getProfessionalByLocationUseCase =
      new GetProfessionalByLocationUseCase({ professionalRepository })
    const getProfessionalByLocationController =
      new GetProfessionalByLocationController({
        getProfessionalByLocationUseCase
      })

    return getProfessionalByLocationController
  }
}

module.exports = GetProfessionalByLocationComposer
