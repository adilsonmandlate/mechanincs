const HttpResponse = require('../../main/helpers/http-response')

class RegisterMechanicController {
  constructor({ registerMechanicUseCase }) {
    this.registerMechanicUseCase = registerMechanicUseCase
  }

  async handle() {
    // if (!httpRequest.body.name) {
    //   throw new Error('Name is missing')
    // }

    // const mechanicData = { name: httpRequest.body.name }

    const registerResponse = await this.registerMechanicUseCase.handle()
    return HttpResponse.ok(registerResponse)
  }
}

module.exports = RegisterMechanicController
