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
      const user = await User.verifyCredentials(data.identifier, data.password)

      if (!user) {
        throw new BadRequestException('Credenciais inválidas')
      }

      // Check if email is verified (optional - can be made required)
      // if (!user.emailVerifiedAt) {
      //   throw new BadRequestException('Por favor, verifique seu email antes de fazer login.')
      // }

      // Load user with roles from repository
      const userWithRoles = await this.userRepository.findByIdWithRoles(user.id)
      if (!userWithRoles) {
        throw new BadRequestException('Usuário não encontrado.')
      }

      const token = await User.accessTokens.create(userWithRoles)

      return {
        token: token.value!.release(),
        user: {
          id: userWithRoles.id,
          name: userWithRoles.name,
          email: userWithRoles.email,
          msisdn: userWithRoles.msisdn,
          emailVerified: !!userWithRoles.emailVerifiedAt,
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
