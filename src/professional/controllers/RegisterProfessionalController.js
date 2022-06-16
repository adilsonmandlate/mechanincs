const HttpResponse = require('../../main/helpers/http-response')

class RegisterProfessionalController {
  constructor({ registerProfessionalUseCase }) {
    this.registerProfessionalUseCase = registerProfessionalUseCase
  }

  async handle(httpRequest) {
    if (
      !httpRequest.body.firstname ||
      !httpRequest.body.lastname ||
      !httpRequest.body.email
    ) {
      return HttpResponse.serverError(400, 'Insert all required data')
    }

    try {
      const professionalData = {
        firstname: httpRequest.body.firstname,
        lastname: httpRequest.body.lastname,
        email: httpRequest.body.email,
        phone: httpRequest.body.phone,
        password: httpRequest.body.password
      }

      const registerResponse = await this.registerProfessionalUseCase.handle(
        professionalData
      )

      return HttpResponse.ok(registerResponse)
    } catch (e) {
      if (e.code === 'P2002') {
        return HttpResponse.serverError(
          409,
          'There is a unique constraint violation, a new user cannot be created with this email and phone'
        )
      }

      return HttpResponse.serverError(500, e)
    }
  }
}

module.exports = RegisterProfessionalController
