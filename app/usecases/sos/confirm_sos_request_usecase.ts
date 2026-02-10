import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { JobEventRepository } from '#repositories/job_event_repository'
import { UserRepository } from '#repositories/user_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { SmsService } from '#services/sms_service'

@inject()
export default class ConfirmSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private jobEventRepository: JobEventRepository,
    private userRepository: UserRepository,
    private smsService: SmsService
  ) {}

  /**
   * Handle SOS by SMS response
   *
   * Commands:
   * - 1 <id> accept
   * - 2 <id> reject
   * - 3 <id> start
   * - 4 <id> complete
   */
  async executeBySms({ msisdn, response }: { msisdn: string; response: string }) {
    // Find user by msisdn
    const user = await this.userRepository.findByMsisdn(msisdn)
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    const raw = response.trim()
    if (!raw) {
      throw new BadRequestException('Mensagem vazia.')
    }

    let command: string
    let requestId: number | null = null

    if (!raw.includes(' ')) {
      // Formato colado, ex.: "142" => comando "1", requestId 42
      const digits = raw.replace(/\D/g, '')
      if (!digits) {
        throw new BadRequestException('Comando inválido.')
      }
      command = digits[0]
      const idPart = digits.slice(1)
      if (idPart) {
        requestId = Number.parseInt(idPart)
      }
    } else {
      // Formato com espaço, ex.: "1 42"
      const cleaned = raw.replace(/\s+/g, ' ')
      const parts = cleaned.split(' ')
      command = parts[0]
      const maybeId = parts[1]
      requestId = maybeId ? Number.parseInt(maybeId) : null
    }

    if (!['1', '2', '3', '4'].includes(command)) {
      throw new BadRequestException('Comando inválido.')
    }

    const loadJobByIdOrLatest = async (): Promise<{ job: any; id: number }> => {
      if (requestId && !Number.isNaN(requestId)) {
        const job = await this.jobRepository.findById(requestId)
        if (!job) throw new NotFoundException('Pedido SOS não encontrado.')
        if (job.professionalId !== user.id) {
          throw new BadRequestException('Este pedido não pertence a você.')
        }
        return { job, id: requestId }
      }

      // Backwards compatible fallback (latest by status)
      if (command === '1' || command === '2') {
        const job = await this.jobRepository.findOpenJobByProfessionalId(user.id)
        if (!job) throw new NotFoundException('Nenhum pedido pendente encontrado.')
        return { job, id: job.id }
      }

      if (command === '3') {
        const job = await this.jobRepository.findAcceptedJobByProfessionalId(user.id)
        if (!job) throw new NotFoundException('Nenhum pedido aceito encontrado.')
        return { job, id: job.id }
      }

      const job = await this.jobRepository.findStartedJobByProfessionalId(user.id)
      if (!job) throw new NotFoundException('Nenhum trabalho iniciado encontrado.')
      return { job, id: job.id }
    }

    const { job, id } = await loadJobByIdOrLatest()

    if (command === '1') {
      if (job.status !== 'open') {
        throw new BadRequestException('Este pedido já foi processado.')
      }

      await this.jobRepository.confirm(id, user.id)
      await this.jobEventRepository.create({
        jobId: id,
        eventType: 'accepted',
        userId: user.id,
        metadata: { type: 'sos', confirmedBy: 'sms' },
      })

      // Step-by-step UX: after accept, send start instructions
      await this.smsService.sendSosAcceptedSms(msisdn, id)

      return { message: 'Pedido SOS aceito com sucesso.', requestId: id, action: 'accepted' }
    }

    if (command === '2') {
      if (job.status !== 'open') {
        throw new BadRequestException('Este pedido já foi processado.')
      }

      await this.jobRepository.reject(id)
      await this.jobEventRepository.create({
        jobId: id,
        eventType: 'canceled',
        userId: user.id,
        metadata: { type: 'sos', rejectedBy: 'sms' },
      })

      return { message: 'Pedido SOS recusado.', requestId: id, action: 'rejected' }
    }

    if (command === '3') {
      if (job.status !== 'accepted') {
        throw new BadRequestException('Este pedido ainda não foi aceito.')
      }

      await this.jobRepository.start(id)
      await this.jobEventRepository.create({
        jobId: id,
        eventType: 'started',
        userId: user.id,
        metadata: { type: 'sos', startedBy: 'sms' },
      })

      // Step-by-step UX: after start, send complete instructions
      await this.smsService.sendSosStartedSms(msisdn, id)

      return { message: 'Trabalho iniciado com sucesso.', requestId: id, action: 'started' }
    }

    // command === '4'
    if (job.status !== 'started') {
      throw new BadRequestException('Este trabalho ainda não foi iniciado.')
    }

    await this.jobRepository.complete(id)
    await this.jobEventRepository.create({
      jobId: id,
      eventType: 'completed',
      userId: user.id,
      metadata: { type: 'sos', completedBy: 'sms' },
    })

    // Optional: send final SMS (can be removed to save cost)
    await this.smsService.sendSosCompletedSms(msisdn, id)

    return { message: 'Trabalho concluído com sucesso.', requestId: id, action: 'completed' }
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
