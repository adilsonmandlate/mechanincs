const Professional = require('../domain/Professional')

class RegisterProfesisonalUseCase {
  constructor({ professionalRepository }) {
    this.professionalRepository = professionalRepository
  }

  async handle(ProfessionalData) {
    const newProfessional = new Professional(ProfessionalData)
    const professional = await this.professionalRepository.add(newProfessional)

    return professional
  }
}

module.exports = RegisterProfesisonalUseCase
