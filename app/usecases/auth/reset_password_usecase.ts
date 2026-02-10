import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import User from '#models/user'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import type { ResetPasswordDto } from '#dtos/auth/reset_password_dto'

@inject()
export default class ResetPasswordUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: ResetPasswordDto) {
    // Find user by reset token
    const user = await this.userRepository.findByResetToken(data.token)

    if (!user) {
      throw new BadRequestException('Token de redefinição inválido ou expirado.')
    }

    // Check if token is expired
    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < DateTime.now()) {
      throw new BadRequestException('Token de redefinição expirado. Solicite um novo.')
    }

    // Hash password and update
    const hashedPassword = await hash.make(data.password)
    await this.userRepository.updatePassword(user.id, hashedPassword)

    // Revoke all existing tokens (optional - for security)
    await User.accessTokens.delete(user, '*')

    return {
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    }
  }
}
