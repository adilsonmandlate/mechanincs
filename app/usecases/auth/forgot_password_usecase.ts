import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { EmailService } from '#services/email_service'
import { SmsService } from '#services/sms_service'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import type { ForgotPasswordDto } from '#dtos/auth/forgot_password_dto'

@inject()
export default class ForgotPasswordUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async execute(data: ForgotPasswordDto) {
    // Find user by email or msisdn
    const user = await this.userRepository.findByEmailOrMsisdn(data.identifier)

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        message: 'Se o email/número existir, você receberá instruções para redefinir sua senha.',
      }
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const resetExpiresAt = DateTime.now().plus({ hours: 1 }) // Token expires in 1 hour

    // Update user with reset token
    await this.userRepository.updateResetToken(user.id, resetToken, resetExpiresAt)

    // Send reset email/SMS
    if (user.email) {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken, user.name)
    }

    if (user.msisdn) {
      await this.smsService.sendPasswordResetSms(user.msisdn, resetToken.substring(0, 6))
    }

    return {
      message: 'Se o email/número existir, você receberá instruções para redefinir sua senha.',
    }
  }
}
