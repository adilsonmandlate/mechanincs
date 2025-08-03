import { inject } from '@adonisjs/core/container'
import { UserRepository } from '#repositories/user_repository'
import db from '@adonisjs/lucid/services/db'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'

@inject()
export default class RegisterUseCase {
  constructor(
    private userRepository: UserRepository
    // private activityLogRepository: ActivityLogRepository
  ) {}

  async execute({ userId, data }: { userId: number; data: any }) {
    const trx = await db.transaction()

    try {
      const emailExists = await this.userRepository.findByEmail(data.email)
      if (emailExists) {
        throw new BadRequestException('O email já está em uso.')
      }

      if (data.msisdn) {
        const msisdnExists = await this.userRepository.findByMsisdn(data.msisdn)
        if (msisdnExists) {
          throw new BadRequestException('O número de celular já está em uso.')
        }
      }

      const user = await this.userRepository.create(data, trx)

      // // Create activity log
      // await this.activityLogRepository.create(
      //   {
      //     userId,
      //     actionType: ActivityType.CREATE,
      //     target: 'User',
      //     targetId: user.id,
      //     description: `Utilizador criado: ${user.name}`,
      //     organizationId,
      //   },
      //   trx
      // )

      await trx.commit()
      return user
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }
}
