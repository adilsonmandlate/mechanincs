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

  async getById() {
    // Get mechanic from database
    return
  }
}

module.exports = MechanicRepository
