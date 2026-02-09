import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { UserRoleRepository } from '#repositories/user_role_repository'
import { SmsService } from '#services/sms_service'
import db from '@adonisjs/lucid/services/db'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import type { RegisterClientDto } from '#dtos/auth/register_client_dto'

@inject()
export default class RegisterClientUseCase {
  constructor(
    private userRepository: UserRepository,
    private userRoleRepository: UserRoleRepository,
    private smsService: SmsService
  ) {}

  async execute({ data }: { data: RegisterClientDto }) {
    const trx = await db.transaction()

    try {
      const msisdnExists = await this.userRepository.findByMsisdn(data.msisdn)
      if (msisdnExists) {
        throw new BadRequestException('O número de celular já está em uso.')
      }

      const verificationToken = randomBytes(32).toString('hex')

      const user = await this.userRepository.create(
        {
          ...data,
          birthdate: data.birthdate ? DateTime.fromJSDate(data.birthdate) : undefined,
          emailVerificationToken: verificationToken,
        },
        trx
      )

      await this.userRoleRepository.create(
        {
          userId: user.id,
          role: 'client',
        },
        trx
      )

      await this.smsService.sendVerificationSms(data.msisdn, verificationToken.substring(0, 6))

      await trx.commit()

      return {
        message:
          'Registro realizado com sucesso. Verifique seu número por SMS para confirmar sua conta.',
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
