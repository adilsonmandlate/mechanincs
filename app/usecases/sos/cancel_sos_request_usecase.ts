import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { JobEventRepository } from '#repositories/job_event_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'

@inject()
export default class CancelSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private jobEventRepository: JobEventRepository
  ) {}

  async execute({ requestId, userId }: { requestId: number; userId: number }) {
    const job = await this.jobRepository.findById(requestId)

    if (!job) {
      throw new NotFoundException('Pedido não encontrado.')
    }

    if (job.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para cancelar este pedido.')
    }

    if (job.status === 'canceled') {
      throw new BadRequestException('Este pedido já foi cancelado.')
    }

    if (job.status === 'completed') {
      throw new BadRequestException('Não é possível cancelar um pedido já completado.')
    }

    // Cancel job
    await this.jobRepository.cancel(requestId)

    // Create job event
    await this.jobEventRepository.create({
      jobId: requestId,
      eventType: 'canceled',
      userId,
      metadata: { type: 'sos' },
    })

    return {
      message: 'Pedido cancelado com sucesso.',
      requestId: job.id,
    }
  }
}
