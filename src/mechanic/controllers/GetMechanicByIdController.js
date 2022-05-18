const HttpResponse = require('../../main/helpers/http-response')

class RegisterMechanicController {
  constructor({ getMechanicByIdUseCase }) {
    this.getMechanicByIdUseCase = getMechanicByIdUseCase
  }

  async handle(httpRequest) {
    const id = httpRequest?.params?.id

    if (!id) {
      return HttpResponse.serverError(400, 'Mechanic id is required')
    }

    try {
      const registerResponse = await this.getMechanicByIdUseCase.handle(
        Number(id)
      )

      if (registerResponse === null) {
        return HttpResponse.serverError(404, 'Mechanic not found')
      }

      return HttpResponse.ok(registerResponse)
    } catch (e) {
      return HttpResponse.serverError(500, e)
    }
  }
}

module.exports = RegisterMechanicController
