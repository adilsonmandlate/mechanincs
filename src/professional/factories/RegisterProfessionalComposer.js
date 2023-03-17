const registerProfessionalController = require('../controllers/RegisterProfessionalController')
const professionalRepository = require('../repositories/ProfessionalRepository')

const RegisterProfessionalComposer = (req) =>
  registerProfessionalController(req, professionalRepository)

module.exports = RegisterProfessionalComposer
