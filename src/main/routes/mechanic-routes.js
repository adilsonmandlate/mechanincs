const { adapt } = require('../adapters/express-router-adapter')
const GetMechanicByIdComposer = require('../factories/GetMechanicByIdComposer')
const RegisterMechanicComposer = require('../factories/RegisterMechanicComposer')

module.exports = (router) => {
  router.get('/mechanics/:id', adapt(GetMechanicByIdComposer.compose()))
  router.post('/mechanics/new', adapt(RegisterMechanicComposer.compose()))
}
