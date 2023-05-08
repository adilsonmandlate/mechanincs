const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const add = async (professionalData) => {
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

const update = async (id, data) => {
  const professional = await prisma.professional.update({
    where: { id },
    data: { ...data }
  })

  return professional
}

const getById = async (professionalId) => {
  const professional = await prisma.professional.findUnique({
    where: {
      id: professionalId
    }
  })

  return professional
}

const getByPhone = async (phone) => {
  const professional = await prisma.professional.findUnique({
    where: { phone: phone.replace('+258', '') }
  })

  return professional
}

const getByLocation = async (latitude, longitude, radius = 5000) => {
  const query =
    await prisma.$queryRaw`SELECT id FROM "Professional" WHERE ST_DWithin(ST_MakePoint(longitude, latitude), ST_MakePoint(${parseFloat(
      longitude
    )}, ${parseFloat(latitude)})::geography, ${radius}::int)`

  const professionals = await prisma.professional.findMany({
    where: {
      id: {
        in: query.map(({ id }) => id)
      }
    }
  })

  return professionals
}

module.exports = {
  add,
  update,
  getById,
  getByPhone,
  getByLocation
}
