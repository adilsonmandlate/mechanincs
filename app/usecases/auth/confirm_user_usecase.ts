import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { ConfirmUserDto } from '#dtos/auth/confirm_user_dto'

@inject()
export default class ConfirmUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: ConfirmUserDto) {
    // Find user by verification token
    const user = await this.userRepository.findByVerificationToken(data.token)

    if (!user) {
      throw new BadRequestException('Token de verificação inválido.')
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email já foi verificado.')
    }

    // Verify email
    await this.userRepository.verifyEmail(user.id)

    // If user has msisdn, we can also verify it (or require separate SMS verification)
    // For now, we'll just verify email

    return {
      message: 'Email verificado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: true,
      },
    }
  }
}

