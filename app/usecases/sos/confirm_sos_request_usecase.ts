import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { JobEventRepository } from '#repositories/job_event_repository'
import { UserRepository } from '#repositories/user_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'

@inject()
export default class ConfirmSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private jobEventRepository: JobEventRepository,
    private userRepository: UserRepository
  ) {}

  /**
   * Confirm SOS request by SMS response (1 = accept, 2 = reject)
   */
  async executeBySms({ msisdn, response }: { msisdn: string; response: string }) {
    // Find user by msisdn
    const user = await this.userRepository.findByMsisdn(msisdn)
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    // Find open job for this professional
    const job = await this.jobRepository.findOpenJobByProfessionalId(user.id)
    if (!job) {
      throw new NotFoundException('Nenhum pedido pendente encontrado.')
    }

    if (job.status !== 'open') {
      throw new BadRequestException('Este pedido já foi processado.')
    }

    const responseCode = response.trim()

    if (responseCode === '1') {
      // Accept
      await this.jobRepository.confirm(job.id, user.id)

      await this.jobEventRepository.create({
        jobId: job.id,
        eventType: 'accepted',
        userId: user.id,
        metadata: { type: 'sos', confirmedBy: 'sms' },
      })

      return {
        message: 'Pedido SOS aceito com sucesso.',
        requestId: job.id,
        action: 'accepted',
      }
    } else if (responseCode === '2') {
      // Reject
      await this.jobRepository.reject(job.id)

      await this.jobEventRepository.create({
        jobId: job.id,
        eventType: 'canceled',
        userId: user.id,
        metadata: { type: 'sos', rejectedBy: 'sms' },
      })

      return {
        message: 'Pedido SOS recusado.',
        requestId: job.id,
        action: 'rejected',
      }
    } else {
      throw new BadRequestException(
        'Resposta inválida. Responda com 1 para aceitar ou 2 para recusar.'
      )
    }
  }

  /**
   * Confirm SOS request by authenticated user
   */
  async executeByUser({ requestId, userId }: { requestId: number; userId: number }) {
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

    // Confirm job
    await this.jobRepository.confirm(requestId, userId)

    // Create job event
    await this.jobEventRepository.create({
      jobId: requestId,
      eventType: 'accepted',
      userId,
      metadata: { type: 'sos', confirmedBy: 'user' },
    })

    return {
      message: 'Pedido SOS confirmado com sucesso.',
      requestId: job.id,
    }
  }
}
