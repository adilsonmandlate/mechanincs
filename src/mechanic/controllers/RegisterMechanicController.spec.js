const RegisterMechanicController = require('./RegisterMechanicController')

const makeRegisterMechanic = () => {
  class AddStub {
    async add(mechanicData) {
      return await Promise.resolve(mechanicData)
    }
  }

  return new AddStub()
}

const makeRegisterMechanicUseCase = () => {
  class HandleStub {
    async handle(mechanicData) {
      return await Promise.resolve(mechanicData)
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
})
