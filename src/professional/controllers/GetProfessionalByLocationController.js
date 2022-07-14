const HttpResponse = require('../../main/helpers/http-response')

class GetProfessionalByLocation {
  constructor({ getProfessionalByLocationUseCase }) {
    this.getProfessionalByLocationUseCase = getProfessionalByLocationUseCase
  }

  async handle(httpRequest) {
    const { latitude, longitude } = httpRequest.params

    if (!latitude || !longitude) {
      return HttpResponse.serverError(
        400,
        'Latitude and Longitude are required'
      )
    }

    try {
      const professionals = await this.getProfessionalByLocationUseCase.handle(
        latitude,
        longitude
      )

      if (professionals === null) {
        return HttpResponse.serverError(
          404,
          'No professional found with these parameters'
        )
      }

      return HttpResponse.ok(professionals)
    } catch (e) {
      return HttpResponse.serverError(500, e)
    }
  }
}

module.exports = GetProfessionalByLocation
