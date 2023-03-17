const res = require('../../main/helpers/http-response')
const sms = require('../../main/config/sms')

const ConfirmProfessionalController = (req, repository) => {
  const professionalId = req.body.professionalId

  if (!professionalId) {
    return res.serverError(500, 'Professional id is required')
  }

  return repository
    .getById(professionalId)
    .then((professional) => {
      if (!professional) {
        return res.serverError(404, 'Professional not found')
      }

      return sms.messages
        .create({
          to: '+258844226545',
          from: '+15075854483',
          body: "Iara's first sms test. To accept this, answer this message with '1', to deny this, answer with '0'"
        })
        .then((resp) => res.ok(resp))
        .catch((err) => res.serverError(500, err))
    })
    .catch((err) => {
      return res.serverError(500, err)
    })
}

module.exports = ConfirmProfessionalController
