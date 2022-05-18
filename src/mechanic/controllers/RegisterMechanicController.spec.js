const RegisterMechanicController = require('./RegisterMechanicController')

const makeRegisterMechanic = () => {
  class AddStub {
    async add(mechanicData) {
      if (mechanicData.email === 'test@mechanic.io') {
        const error = new Error('Forced new p2002 error')
        error.code = 'P2002'
        throw error
      }

      if (mechanicData.name === 'forceError') {
        throw new Error('Forced new Error')
      }

      return await Promise.resolve(mechanicData)
    }
  }

  return new AddStub()
}

const makeRegisterMechanicUseCase = () => {
  class HandleStub {
    async handle(mechanicData) {
      return await makeRegisterMechanic().add(mechanicData)
    }
  }
  return new HandleStub()
}

const makeSut = () => {
  const mechanicRepository = makeRegisterMechanic()
  const registerMechanicUseCase = makeRegisterMechanicUseCase({
    MechanicRepository: mechanicRepository
  })
  const sut = new RegisterMechanicController({ registerMechanicUseCase })
  return { sut, mechanicRepository, registerMechanicUseCase }
}

describe('Register Mechanic controller', () => {
  it('should return error 400 if no name is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        email: 'iarilson@gmail.com'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({ error: 'Name and email are required' })
  })

  it('should return error 400 if no email is provided', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'Iarilson'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({ error: 'Name and email are required' })
  })

  it('should call register Mechanic UseCase with correct values and return 200', async () => {
    const { sut, registerMechanicUseCase } = makeSut()
    const registerSpy = jest.spyOn(registerMechanicUseCase, 'handle')

    const httpRequest = {
      body: {
        name: 'Iarilson',
        email: 'iarilson@gmail.com'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(registerSpy).toHaveBeenCalledWith({
      name: 'Iarilson',
      email: 'iarilson@gmail.com'
    })

    expect(httpResponse.statusCode).toBe(200)
  })

  it('should return 409 if email is registered', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'Teste',
        email: 'test@mechanic.io'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(409)
  })

  it('should return 500 if email is registered', async () => {
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'forceError',
        email: 'user@mechanic.io'
      }
    }

    const httpResponse = await sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
  })
})
