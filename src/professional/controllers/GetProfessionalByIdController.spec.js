const GetProfessionalByIdController = require('./GetProfessionalByIdController')

const makeGetProfessionalById = () => {
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

const makeGetProfessionalByIdUseCase = () => {
  class HandleStub {
    async handle(id) {
      return await makeGetProfessionalById().getById(id)
    }
  }
  return new HandleStub()
}

const makeSut = () => {
  const professionalRepository = makeGetProfessionalById()
  const getProfessionalByIdUseCase = makeGetProfessionalByIdUseCase({
    ProfessionalRepository: professionalRepository
  })
  const sut = new GetProfessionalByIdController({ getProfessionalByIdUseCase })
  return { sut, professionalRepository, getProfessionalByIdUseCase }
}

describe('Get Professional by Id Controller', () => {
  it('should return error 400 if the id is missing from params', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      params: {
        id: null
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({ error: 'Professional id is required' })
  })

  it('should return given professional data if id is provided', async () => {
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

  it("should return 404 if the professional doesn't exist", async () => {
    const { sut } = makeSut()

    const httpRequest = {
      params: {
        id: 3
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(404)
    expect(httpResponse.body).toEqual({ error: 'Professional not found' })
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
