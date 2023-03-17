const inboundController = require('../controllers/InboundController')

const InboundComposer = (req, res) => inboundController(req, res)

module.exports = InboundComposer
