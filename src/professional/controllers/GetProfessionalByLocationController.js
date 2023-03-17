const res = require('../../main/helpers/http-response')

const GetProfessionalByLocationController = async (req, repository) => {
  const { latitude, longitude } = req.params

  if (!latitude || !longitude) {
    return res.serverError(400, 'Latitude and Longitude are required')
  }

  return repository
    .getByLocation(latitude, longitude)
    .then((professionals) => {
      if (professionals === null) {
        return res.serverError(
          404,
          'No professional found with these parameters'
        )
      }

      return res.ok(professionals)
    })
    .catch((err) => {
      return res.serverError(500, err)
    })
}

module.exports = GetProfessionalByLocationController
