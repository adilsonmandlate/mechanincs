import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { UserRoleRepository } from '#repositories/user_role_repository'
import { ProfessionRepository } from '#repositories/profession_repository'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import { SmsService } from '#services/sms_service'
import { LocationService } from '#services/location_service'
import db from '@adonisjs/lucid/services/db'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import type { RegisterProfessionalDto } from '#dtos/auth/register_professional_dto'

@inject()
export default class RegisterProfessionalUseCase {
  constructor(
    private userRepository: UserRepository,
    private userRoleRepository: UserRoleRepository,
    private professionRepository: ProfessionRepository,
    private professionalProfileRepository: ProfessionalProfileRepository,
    private smsService: SmsService,
    private locationService: LocationService
  ) {}

  async execute({ data }: { data: RegisterProfessionalDto }) {
    const trx = await db.transaction()

    try {
      const msisdnExists = await this.userRepository.findByMsisdn(data.msisdn)
      if (msisdnExists) {
        throw new BadRequestException('O número de celular já está em uso.')
      }

      await this.professionRepository.findByIdOrFail(data.professionId)

      const verificationToken = randomBytes(32).toString('hex')

      const { professionId, education, yearsOfExperience, about, location, ...userData } = data

      const locationPoint = this.locationService.toPostGISPoint(location)

      const user = await this.userRepository.create(
        {
          ...userData,
          birthdate: userData.birthdate ? DateTime.fromJSDate(userData.birthdate) : undefined,
          emailVerificationToken: verificationToken,
        },
        trx
      )

      await this.userRoleRepository.create(
        {
          userId: user.id,
          role: 'professional',
        },
        trx
      )

      await this.professionalProfileRepository.create(
        {
          userId: user.id,
          professionId,
          education,
          yearsOfExperience,
          about: about || null,
          location: locationPoint,
          status: 'pending',
          ratingAvg: 0,
          ratingCount: 0,
        },
        trx
      )

      await this.smsService.sendVerificationSms(data.msisdn, verificationToken.substring(0, 6))

      await trx.commit()

      return {
        user: {
          id: user.id,
          name: user.name,
          msisdn: user.msisdn,
        },
        message:
          'Registro realizado com sucesso. Verifique seu número por SMS para confirmar sua conta.',
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
