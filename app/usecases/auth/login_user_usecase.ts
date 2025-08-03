import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import User from '#models/user'

export default class LoginUserUseCase {
  async execute({ data }: { data: { identifier: string; password: string } }) {
    try {
      const user = await User.verifyCredentials(data.identifier, data.password)

      if (!user) {
        throw new BadRequestException('Credenciais inválidas')
      }

      const token = await User.accessTokens.create(user)

      return {
        token: token.value!.release(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles.map((role) => role.role),
        },
      }
    } catch (error: any) {
      throw error
    }
  }
}
