const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class MechanicRepository {
  async add(mechanicData) {
    const mechanic = await prisma.mechanic.create({
      data: {
        name: mechanicData.name,
        email: mechanicData.email
      }
    })

    return mechanic
  }

  async getById(mechanicId) {
    const mechanic = await prisma.mechanic.findUnique({
      where: {
        id: mechanicId
      }
    })

    return mechanic
  }
}

module.exports = MechanicRepository
