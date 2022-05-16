const HttpResponse = require('../../main/helpers/http-response')

class RegisterMechanicController {
  constructor({ registerMechanicUseCase }) {
    this.registerMechanicUseCase = registerMechanicUseCase
  }

  async handle(httpRequest) {
    if (!httpRequest.body) {
      return HttpResponse.ServerError()
    }

    const mechanicData = {
      name: httpRequest.body.name,
      email: httpRequest.body.email
    }

    const registerResponse = await this.registerMechanicUseCase.handle(
      mechanicData
    )
    return HttpResponse.ok(registerResponse)
  }
}

module.exports = RegisterMechanicController
