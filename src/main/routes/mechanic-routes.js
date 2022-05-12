const { adapt } = require('../adapters/express-router-adapter')
const RegisterMechanicComposer = require('../factories/RegisterMechanicComposer')

module.exports = (router) => {
  router.get('/mechanic', adapt(RegisterMechanicComposer.compose()))
}
