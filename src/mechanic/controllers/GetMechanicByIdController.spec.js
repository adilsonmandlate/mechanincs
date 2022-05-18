const GetMechanicByIdController = require('./GetMechanicByIdController')

const makeGetMechanicById = () => {
  class GetById {
    async getById(id) {
      if (id === 2) {
        throw new Error('Forced new Error')
      }

      if (id !== 1) {
        return null
      }

      return await Promise.resolve({
        id,
        name: 'Iarilson',
        email: 'iarilson@gmail.com'
      })
    }
  }
  return new GetById()
}

const makeGetMechanicByIdUseCase = () => {
  class HandleStub {
    async handle(id) {
      return await makeGetMechanicById().getById(id)
    }
  }
  return new HandleStub()
}

const makeSut = () => {
  const mechanicRepository = makeGetMechanicById()
  const getMechanicByIdUseCase = makeGetMechanicByIdUseCase({
    MechanicRepository: mechanicRepository
  })
  const sut = new GetMechanicByIdController({ getMechanicByIdUseCase })
  return { sut, mechanicRepository, getMechanicByIdUseCase }
}

describe('Get Mechanic by Id Controller', () => {
  it('should return error 400 if the id is missing from params', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      params: {
        id: null
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({ error: 'Mechanic id is required' })
  })

  it('should return given mechanic data if id is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      params: {
        id: 1
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 1,
      name: 'Iarilson',
      email: 'iarilson@gmail.com'
    })
  })

  it("should return 404 if the mechanic doesn't exist", async () => {
    const { sut } = makeSut()

    const httpRequest = {
      params: {
        id: 3
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(404)
    expect(httpResponse.body).toEqual({ error: 'Mechanic not found' })
  })

  it('should return 500 if theres any other error', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      params: {
        id: 2
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
