import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import { UserRoleRepository } from '#repositories/user_role_repository'
import { ProfessionRepository } from '#repositories/profession_repository'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import { EmailService } from '#services/email_service'
import { SmsService } from '#services/sms_service'
import { LocationService } from '#services/location_service'
import db from '@adonisjs/lucid/services/db'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import type { RegisterProfessionalDto } from '#dtos/auth/register_professional_dto'

@inject()
export default class RegisterProfessionalUseCase {
  private emailService = new EmailService()
  private smsService = new SmsService()
  private locationService = new LocationService()

  constructor(
    private userRepository: UserRepository,
    private userRoleRepository: UserRoleRepository,
    private professionRepository: ProfessionRepository,
    private professionalProfileRepository: ProfessionalProfileRepository
  ) {}

  async execute({ data }: { data: RegisterProfessionalDto }) {
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

      // Verify profession exists
      await this.professionRepository.findByIdOrFail(data.professionId)

      // Generate verification token
      const emailVerificationToken = randomBytes(32).toString('hex')

      // Extract professional-specific data
      const { professionId, education, yearsOfExperience, about, location, ...userData } = data

      // Convert location object to PostGIS POINT string
      const locationPoint = this.locationService.toPostGISPoint(location)

      // Create user
      const user = await this.userRepository.create(
        {
          ...userData,
          birthdate: userData.birthdate ? DateTime.fromJSDate(userData.birthdate) : undefined,
          emailVerificationToken,
        },
        trx
      )

      // Create professional role
      await this.userRoleRepository.create(
        {
          userId: user.id,
          role: 'professional',
        },
        trx
      )

      // Create professional profile
      await this.professionalProfileRepository.create(
        {
          userId: user.id,
          professionId,
          education,
          yearsOfExperience,
          about: about || null,
          location: locationPoint,
          status: 'pending', // Needs verification before being active
          ratingAvg: 0,
          ratingCount: 0,
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
