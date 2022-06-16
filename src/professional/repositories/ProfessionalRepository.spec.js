const ProfessionalRepository = require('./ProfessionalRepository')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const makeSut = () => {
  return new ProfessionalRepository()
}

describe('Professional repository test', () => {
  beforeAll(() => {
    prisma.$connect()
  })

  afterEach(async () => {
    await prisma.professional.deleteMany({
      where: {
        email: 'user@professional.io'
      }
    })
  })

  afterAll(() => {
    prisma.$disconnect()
  })

  it('should return null if no professional is found', async () => {
    const sut = makeSut()
    const professional = await sut.getById('null')

    expect(professional).toBe(null)
  })

  it('should return professional if created succefully', async () => {
    const sut = makeSut()
    const professionalData = {
      firstname: 'User',
      lastname: 'Tested',
      phone: '840000000',
      password: 'testuser',
      email: 'user@professional.io'
    }
    const professional = await sut.add(professionalData)
    expect(professional.email).toBe(professionalData.email)
  })

  it('should throw error if no email is provided', async () => {
    const sut = makeSut()
    const professionalData = {
      firstname: 'User',
      lastname: 'Tested',
      phone: '840000001',
      password: 'testuser'
    }
    const promise = sut.add(professionalData)
    expect(promise).rejects.toThrow()
  })

  it('should throw error if email is already registred', async () => {
    const sut = makeSut()
    const professional1 = {
      firstname: 'User1',
      lastname: 'Tested',
      phone: '840000002',
      password: 'testuser',
      email: 'user@professional.io'
    }
    const professional2 = {
      firstname: 'User2',
      lastname: 'Tested',
      phone: '840000003',
      password: 'testuser',
      email: 'user@professional.io'
    }

    // eslint-disable-next-line no-unused-vars
    const temp = await sut.add(professional1)
    const promise = sut.add(professional2)
    expect(promise).rejects.toThrow()
  })
})
