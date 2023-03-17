const professionalRepository = require('../repositories/ProfessionalRepository')
const getProfessionalByIdController = require('../controllers/GetProfessionalByIdController')

const GetProfessionalByIdComposer = (req) =>
  getProfessionalByIdController(req, professionalRepository)

module.exports = GetProfessionalByIdComposer
