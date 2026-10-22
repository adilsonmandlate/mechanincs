import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { SosLifecycleService } from '#services/sos_lifecycle_service'

@inject()
export default class RejectSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private lifecycle: SosLifecycleService
  ) {}

  async execute({ requestId, userId }: { requestId: number; userId: number }) {
    const job = await this.jobRepository.findById(requestId)

    if (!job) {
      throw new NotFoundException('Pedido SOS não encontrado.')
    }

    if (job.professionalId !== userId) {
      throw new BadRequestException('Este pedido não pertence a você.')
    }

    await this.lifecycle.reject(requestId, userId, 'user')

    return {
      message: 'Pedido SOS recusado.',
      requestId: job.id,
    }
  }
}
