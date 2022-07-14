const { adapt } = require('../adapters/express-router-adapter')
const GetProfessionalByIdComposer = require('../factories/GetProfessionalByIdComposer')
const GetProfessionalByLocationComposer = require('../factories/GetProfessionalByLocationComposer')
const RegisterProfessionalComposer = require('../factories/RegisterProfessionalComposer')

module.exports = (router) => {
  router.get('/professionals/:id', adapt(GetProfessionalByIdComposer.compose()))
  router.get(
    '/professionals/:latitude/:longitude',
    adapt(GetProfessionalByLocationComposer.compose())
  )
  router.post(
    '/professionals/new',
    adapt(RegisterProfessionalComposer.compose())
  )
}
