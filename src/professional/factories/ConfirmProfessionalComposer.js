const repository = require('../repositories/ProfessionalRepository')
const confirmProfessionalController = require('../controllers/ConfirmProfessionalController')

const ConfirmProfessionalComposer = (req) =>
  confirmProfessionalController(req, repository)

module.exports = ConfirmProfessionalComposer
