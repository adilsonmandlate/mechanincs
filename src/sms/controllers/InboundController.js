const { MessagingResponse } = require('twilio').twiml

const InboundController = (req, res) => {
  const twiml = new MessagingResponse()

  /**
   * We should now check who sent the message and do what we are supposed to next.
   * Verificar como enviar os detalhes do cliente e do profissional para cada um deles.
   * And thats it.
   */

  twiml.message('Confirmado. Enviamos em breve os detalhes do teu cliente.')
  return res.type('text/xml').send(twiml.toString())
}

module.exports = InboundController
