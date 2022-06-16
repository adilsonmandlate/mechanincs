const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class ProfessionalRepository {
  async add(professionalData) {
    const professional = await prisma.professional.create({
      data: {
        firstname: professionalData.firstname,
        lastname: professionalData.lastname,
        email: professionalData.email,
        phone: professionalData.phone,
        password: professionalData.password
      }
    })

    return professional
  }

  async update(professionalId, professionalData) {
    const professional = await prisma.professional.update({
      where: {
        id: professionalId
      },
      data: {
        ...professionalData
      }
    })

    return professional
  }

  async getById(professionalId) {
    const professional = await prisma.professional.findUnique({
      where: {
        id: professionalId
      }
    })

    return professional
  }
}

module.exports = ProfessionalRepository
