const { adapt } = require('../adapters/express-router-adapter')
const GetProfessionalByIdComposer = require('../../professional/factories/GetProfessionalByIdComposer')
const GetProfessionalByLocationComposer = require('../../professional/factories/GetProfessionalByLocationComposer')
const RegisterProfessionalComposer = require('../../professional/factories/RegisterProfessionalComposer')
const ConfirmProfessionalComposer = require('../../professional/factories/ConfirmProfessionalComposer')
const InboundComposer = require('../../sms/factories/InboundComposer')

module.exports = (router) => {
  router.get('/professionals/:id', adapt(GetProfessionalByIdComposer))
  router.get(
    '/professionals/:latitude/:longitude',
    adapt(GetProfessionalByLocationComposer)
  )
  router.post('/professionals/new', adapt(RegisterProfessionalComposer))
  router.post('/professionals/update/:id', adapt(RegisterProfessionalComposer))
  router.post('/professionals/choose', adapt(ConfirmProfessionalComposer))
  router.post('/professionals/confirm-job/message', InboundComposer)
}
