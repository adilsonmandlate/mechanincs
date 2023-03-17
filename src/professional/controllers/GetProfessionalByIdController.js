const res = require('../../main/helpers/http-response')

const GetProfessionalByIdController = (req, repository) => {
  const id = req.params?.id

  if (!id) {
    return res.serverError(404, 'Professional id is required')
  }

  return repository
    .getById(id)
    .then((professional) => {
      if (!professional) {
        return res.serverError(404, 'Professional not found')
      }

      return res.ok(professional)
    })
    .catch((err) => {
      return res.serverError(500, err)
    })
}

module.exports = GetProfessionalByIdController
