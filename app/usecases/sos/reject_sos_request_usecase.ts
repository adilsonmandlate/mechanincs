import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { JobEventRepository } from '#repositories/job_event_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'

@inject()
export default class RejectSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private jobEventRepository: JobEventRepository
  ) {}

  async execute({ requestId, userId }: { requestId: number; userId: number }) {
    const job = await this.jobRepository.findById(requestId)

    if (!job) {
      throw new NotFoundException('Pedido SOS não encontrado.')
    }

    if (job.professionalId !== userId) {
      throw new BadRequestException('Este pedido não pertence a você.')
    }

    if (job.status !== 'open') {
      throw new BadRequestException('Este pedido já foi processado.')
    }

    // Reject job
    await this.jobRepository.reject(requestId)

    // Create job event
    await this.jobEventRepository.create({
      jobId: requestId,
      eventType: 'canceled',
      userId,
      metadata: { type: 'sos', rejectedBy: 'user' },
    })

    return {
      message: 'Pedido SOS recusado.',
      requestId: job.id,
    }
  }
}
