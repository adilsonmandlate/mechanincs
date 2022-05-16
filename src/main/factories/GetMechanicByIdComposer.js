const GetMechanicByIdUseCase = require('../../mechanic/usecases/get-mechanic-by-id')
const GetMechanicByIdController = require('../../mechanic/controllers/GetMechanicByIdController')
const MechanicRepository = require('../../mechanic/repositories/MechanicRepository')

class GetMechanicByIdComposer {
  static compose() {
    const mechanicRepository = new MechanicRepository()
    const getMechanicByIdUseCase = new GetMechanicByIdUseCase({
      MechanicRepository: mechanicRepository
    })
    const getMechanicByIdController = new GetMechanicByIdController({
      getMechanicByIdUseCase
    })
    return getMechanicByIdController
  }
}

module.exports = GetMechanicByIdComposer
