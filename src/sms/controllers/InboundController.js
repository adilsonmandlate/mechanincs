const { MessagingResponse } = require('twilio').twiml
const { emitter } = require('../../utils/eventEmiter')

const InboundController = (req, res) => {
  let responseText
  const twiml = new MessagingResponse()
  const message = req.body.Body

  switch (message?.trim()) {
    case '1':
    case 'sim':
    case 'yes':
    case 'aceitar':
    case 'aceite':
      responseText =
        'Confirmado. Enviamos dentro de instantes os detalhes do teu cliente.'
      emitter.emit('trabalho:aceite', req.body.From)
      break
    case '0':
    case 'nao':
    case 'no':
    case 'negar':
    case 'recusado':
    case 'recusar':
      responseText = 'Obrigado.'
      emitter.emit('trabalho:recusado', req.body.From)
      break
    default:
      responseText =
        'Por favor, responda com 1 para aceitar ou com 0 para recusar.'
  }

  twiml.message(responseText)
  return res.type('text/xml').send(twiml.toString())
}

module.exports = InboundController
