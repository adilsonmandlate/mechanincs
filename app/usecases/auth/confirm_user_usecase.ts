import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import type { ConfirmUserDto } from '#dtos/auth/confirm_user_dto'

@inject()
export default class ConfirmUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(data: ConfirmUserDto) {
    const user = await this.userRepository.findByVerificationToken(data.token)

    if (!user) {
      throw new BadRequestException('Código de verificação inválido.')
    }

    if (user.msisdnVerifiedAt) {
      throw new BadRequestException('Conta já verificada.')
    }

    await this.userRepository.verifyMsisdn(user.id)

    return {
      message: 'Conta verificada com sucesso!',
    }
  }
}
