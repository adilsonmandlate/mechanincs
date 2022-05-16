const HttpResponse = require('../../main/helpers/http-response')

class RegisterMechanicController {
  constructor({ registerMechanicUseCase }) {
    this.registerMechanicUseCase = registerMechanicUseCase
  }

  async handle(httpRequest) {
    if (!httpRequest.body.name || !httpRequest.body.email) {
      return HttpResponse.serverError(400, 'Name and email are required')
    }

    try {
      const mechanicData = {
        name: httpRequest.body.name,
        email: httpRequest.body.email
      }

      const registerResponse = await this.registerMechanicUseCase.handle(
        mechanicData
      )

      return HttpResponse.ok(registerResponse)
    } catch (e) {
      if (e.code === 'P2002') {
        return HttpResponse.serverError(
          409,
          'There is a unique constraint violation, a new user cannot be created with this email'
        )
      }

      return HttpResponse.serverError(500, e)
    }
  }
}

module.exports = RegisterMechanicController
