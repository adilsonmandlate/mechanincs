import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { UserRoleRepository } from '#repositories/user_role_repository'
import { EmailService } from '#services/email_service'
import { SmsService } from '#services/sms_service'
import db from '@adonisjs/lucid/services/db'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import type { RegisterClientDto } from '#dtos/auth/register_client_dto'

@inject()
export default class RegisterClientUseCase {
  private emailService = new EmailService()
  private smsService = new SmsService()

  constructor(
    private userRepository: UserRepository,
    private userRoleRepository: UserRoleRepository
  ) {}

  async execute({ data }: { data: RegisterClientDto }) {
    const trx = await db.transaction()

    try {
      // Check if email exists
      const emailExists = await this.userRepository.findByEmail(data.email)
      if (emailExists) {
        throw new BadRequestException('O email já está em uso.')
      }

      // Check if msisdn exists
      const msisdnExists = await this.userRepository.findByMsisdn(data.msisdn)
      if (msisdnExists) {
        throw new BadRequestException('O número de celular já está em uso.')
      }

      // Generate verification token
      const emailVerificationToken = randomBytes(32).toString('hex')

      // Create user
      const user = await this.userRepository.create(
        {
          ...data,
          birthdate: data.birthdate ? DateTime.fromJSDate(data.birthdate) : undefined,
          emailVerificationToken,
        },
        trx
      )

      // Create client role
      await this.userRoleRepository.create(
        {
          userId: user.id,
          role: 'client',
        },
        trx
      )

      // Send verification emails/SMS
      await this.emailService.sendVerificationEmail(data.email, emailVerificationToken, data.name)
      await this.smsService.sendVerificationSms(data.msisdn, emailVerificationToken.substring(0, 6))

      await trx.commit()

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          msisdn: user.msisdn,
        },
        message:
          'Registro realizado com sucesso. Verifique seu email e SMS para confirmar sua conta.',
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
