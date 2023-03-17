const getProfessionalByLocationController = require('../controllers/GetProfessionalByLocationController')
const professionalRepository = require('../repositories/ProfessionalRepository')

const GetProfessionalByLocationComposer = (req) =>
  getProfessionalByLocationController(req, professionalRepository)

module.exports = GetProfessionalByLocationComposer
