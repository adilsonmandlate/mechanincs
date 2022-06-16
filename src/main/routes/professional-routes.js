const { adapt } = require('../adapters/express-router-adapter')
const GetProfessionalByIdComposer = require('../factories/GetProfessionalByIdComposer')
const RegisterProfessionalComposer = require('../factories/RegisterProfessionalComposer')

module.exports = (router) => {
  router.get('/professionals/:id', adapt(GetProfessionalByIdComposer.compose()))
  router.post(
    '/professionals/new',
    adapt(RegisterProfessionalComposer.compose())
  )
}
