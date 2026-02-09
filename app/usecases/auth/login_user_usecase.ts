import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import User from '#models/user'
import type { LoginDto } from '#dtos/auth/login_dto'

@inject()
export default class LoginUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ data }: { data: LoginDto }) {
    try {
      const user = await User.verifyCredentials(data.msisdn, data.password)

      if (!user) {
        throw new BadRequestException('Credenciais inválidas')
      }

      if (!user.msisdnVerifiedAt) {
        throw new BadRequestException('Por favor, verifique seu número por SMS antes de fazer login.')
      }

      const userWithRoles = await this.userRepository.findByIdWithRoles(user.id)

      if (!userWithRoles) {
        throw new BadRequestException('Credenciais inválidas')
      }

      const token = await User.accessTokens.create(userWithRoles)

      return {
        token: token.value!.release(),
        user: {
          id: userWithRoles.id,
          name: userWithRoles.name,
          msisdn: userWithRoles.msisdn,
          msisdnVerified: !!userWithRoles.msisdnVerifiedAt,
          roles: userWithRoles.roles.map((role) => role.role),
        },
      }
    } catch (error: any) {
      if (error.message === 'Invalid user credentials') {
        throw new BadRequestException('Credenciais inválidas')
      }
      throw error
    }
  }
}
