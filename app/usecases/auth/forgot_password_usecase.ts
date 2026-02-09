import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { SmsService } from '#services/sms_service'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import type { ForgotPasswordDto } from '#dtos/auth/forgot_password_dto'

@inject()
export default class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private smsService: SmsService
  ) {}

  async execute(data: ForgotPasswordDto) {
    const user = await this.userRepository.findByMsisdn(data.msisdn)

    if (!user) {
      return {
        message: 'Se o número existir, você receberá um SMS com instruções para redefinir sua senha.',
      }
    }

    const resetToken = randomBytes(32).toString('hex')
    const resetExpiresAt = DateTime.now().plus({ hours: 1 })

    await this.userRepository.updateResetToken(user.id, resetToken, resetExpiresAt)

    await this.smsService.sendPasswordResetSms(user.msisdn, resetToken.substring(0, 6))

    return {
      message: 'Se o número existir, você receberá um SMS com instruções para redefinir sua senha.',
    }
  }
}
