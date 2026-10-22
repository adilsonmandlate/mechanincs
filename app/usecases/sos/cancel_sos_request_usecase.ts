import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { SosLifecycleService } from '#services/sos_lifecycle_service'
import { SmsService } from '#services/sms_service'
import { UserRepository } from '#repositories/user_repository'

@inject()
export default class CancelSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private lifecycle: SosLifecycleService,
    private smsService: SmsService,
    private userRepository: UserRepository
  ) {}

  async execute({ requestId, userId }: { requestId: number; userId: number }) {
    const job = await this.jobRepository.findById(requestId)

    if (!job) {
      throw new NotFoundException('Pedido não encontrado.')
    }

    if (job.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para cancelar este pedido.')
    }

    const result = await this.lifecycle.cancel(requestId, userId)

    if (result.changed && result.job.professionalId) {
      const professional = await this.userRepository.findById(result.job.professionalId)
      if (professional?.msisdn) {
        await this.smsService.sendCustomerCanceledSosSms(professional.msisdn, requestId)
      }
    }

    return {
      message: 'Pedido cancelado com sucesso.',
      requestId: job.id,
    }
  }
}
