const RegisterProfessionalController = require('./RegisterProfessionalController')

const makeRegisterProfessional = () => {
  class AddStub {
    async add(professionalData) {
      if (professionalData.email === 'test@professional.io') {
        const error = new Error('Forced new p2002 error')
        error.code = 'P2002'
        throw error
      }

      if (professionalData.firstname === 'forceError') {
        throw new Error('Forced new Error')
      }

      return await Promise.resolve(professionalData)
    }
  }

  return new AddStub()
}

const makeRegisterProfesisonalUseCase = () => {
  class HandleStub {
    async handle(professionalData) {
      return await makeRegisterProfessional().add(professionalData)
    }
  }
  return new HandleStub()
}

const makeSut = () => {
  const professionalRepository = makeRegisterProfessional()
  const registerProfessionalUseCase = makeRegisterProfesisonalUseCase({
    ProfessionalRepository: professionalRepository
  })
  const sut = new RegisterProfessionalController({
    registerProfessionalUseCase
  })
  return { sut, professionalRepository, registerProfessionalUseCase }
}

describe('Register Professional controller', () => {
  it('should return error 400 if no name is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        email: 'iarilson@gmail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({ error: 'Insert all required data' })
  })

  it('should return error 400 if no email is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        firstname: 'Iarilson',
        lastname: 'Mandlate'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({ error: 'Insert all required data' })
  })

  it('should call register Professional UseCase with correct values and return 200', async () => {
    const { sut, registerProfessionalUseCase } = makeSut()
    const registerSpy = jest.spyOn(registerProfessionalUseCase, 'handle')

    const httpRequest = {
      body: {
        firstname: 'Iarilson',
        lastname: 'Mandlate',
        email: 'iarilson@gmail.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(registerSpy).toHaveBeenCalledWith({
      firstname: 'Iarilson',
      lastname: 'Mandlate',
      email: 'iarilson@gmail.com'
    })

    expect(httpResponse.statusCode).toBe(200)
  })

  it('should return 409 if email is registered', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        firstname: 'Teste',
        lastname: 'Mandlate',
        email: 'test@professional.io'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(409)
  })

  it('should return 500 if unknown error is thrown', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        firstname: 'forceError',
        lastname: 'ErrorMessage',
        email: 'user@professional.io'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })
})
