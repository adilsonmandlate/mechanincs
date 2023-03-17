const InboundComposer = require('../../sms/factories/InboundComposer')

module.exports = (router) => {
  router.post('/', InboundComposer)
}
