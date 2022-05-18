const MechanicRepository = require('./MechanicRepository')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const makeSut = () => {
  return new MechanicRepository()
}

describe('Mechanic repository test', () => {
  afterEach(async () => {
    await prisma.mechanic.deleteMany({
      where: {
        email: 'user@mechanic.io'
      }
    })
  })

  it('should return null if no mechanic is found', async () => {
    const sut = makeSut()
    const mechanic = await sut.getById(0)

    expect(mechanic).toBe(null)
  })

  it('should return user if user is found', async () => {
    const sut = makeSut()
    const mechanic = await sut.getById(1)

    expect(mechanic.id).toBe(1)
  })

  it('should return mechanic if created succefully', async () => {
    const sut = makeSut()
    const mechanicData = {
      name: 'User',
      email: 'user@mechanic.io'
    }
    const mechanic = await sut.add(mechanicData)
    expect(mechanic.email).toBe(mechanicData.email)
  })

  it('should throw error if no email is provided', async () => {
    const sut = makeSut()
    const mechanicData = {
      name: 'User'
    }
    const promise = sut.add(mechanicData)
    expect(promise).rejects.toThrow()
  })

  it('should throw error if email is already registred', async () => {
    const sut = makeSut()
    const mechanic1 = {
      name: 'User1',
      email: 'user@mechanic.io'
    }
    const mechanic2 = {
      name: 'User2',
      email: 'user@mechanic.io'
    }

    // eslint-disable-next-line no-unused-vars
    const temp = await sut.add(mechanic1)
    const promise = sut.add(mechanic2)
    expect(promise).rejects.toThrow()
  })
})
