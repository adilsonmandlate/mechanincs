const HttpResponse = require('../../main/helpers/http-response')

class GetProfessionalByIdController {
  constructor({ getProfessionalByIdUseCase }) {
    this.getProfessionalByIdUseCase = getProfessionalByIdUseCase
  }

  async handle(httpRequest) {
    const id = httpRequest?.params?.id

    if (!id) {
      return HttpResponse.serverError(400, 'Professional id is required')
    }

    try {
      const registerResponse = await this.getProfessionalByIdUseCase.handle(
        Number(id)
      )

      if (registerResponse === null) {
        return HttpResponse.serverError(404, 'Professional not found')
      }

      return HttpResponse.ok(registerResponse)
    } catch (e) {
      return HttpResponse.serverError(500, e)
    }
  }
}

module.exports = GetProfessionalByIdController
