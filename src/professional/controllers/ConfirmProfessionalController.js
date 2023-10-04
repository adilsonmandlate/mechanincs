const res = require('../../main/helpers/http-response')
const sms = require('../../main/config/sms')
const socket = require('../../utils/socketio')
const { emitter } = require('../../utils/eventEmiter')

const ConfirmProfessionalController = (req, repository) => {
  const { professionalId } = req.body
  const io = socket.getIO('/professionals').on('connection', (socket) => socket)

  if (!professionalId) {
    return res.serverError(400, 'Professional id is required')
  }

  emitter.on('trabalho:aceite', (phone) => {
    repository
      .getByPhone(phone)
      .then((professional) => {
        return repository.update(professional.id, { state: 'Busy' })
      })
      .then((professional) => {
        emitter.emit('ProfessionalRequest:accepted', professional)
        io.emit('ProfessionalRequest:accepted', professional)
      })
      .catch((err) => {
        emitter.emit('ProfessionalRequest:error', err.message)
        io.emit('ProfessionalRequest:error', err.message)
      })
  })

  return repository
    .getById(professionalId)
    .then((professional) => {
      if (!professional) {
        return res.serverError(404, 'Professional not found')
      }

      return sms.service.messages
        .create({
          to: `+258${professional.phone}`,
          from: sms.fromNumber,
          body: `${professional.firstname}, alguém solicita teus serviços. Para aceitar, responda essa mensagem com '1', caso contrario, responda com '0'`
        })
        .then(() => {
          return repository.update(professionalId, { state: 'Pending' })
        })
        .then(() => res.ok())
        .catch((err) => res.serverError(500, err))
    })
    .catch((err) => {
      return res.serverError(500, err)
    })
}

module.exports = ConfirmProfessionalController
