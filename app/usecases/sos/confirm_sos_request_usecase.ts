import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'
import { UserRepository } from '#repositories/user_repository'
import { NotFoundException } from '#exceptions/generic/not_found_exception'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { SmsService } from '#services/sms_service'
import { SmsMessageRepository } from '#repositories/sms_message_repository'
import { AssistanceRealtimeService } from '#services/assistance_realtime_service'
import { SosLifecycleService } from '#services/sos_lifecycle_service'
import { extractSosRequestId, parseSosSmsCommand, sosSmsCommands } from '#services/sos_sms_protocol'

@inject()
export default class ConfirmSosRequestUseCase {
  constructor(
    private jobRepository: JobRepository,
    private userRepository: UserRepository,
    private smsService: SmsService,
    private smsMessageRepository: SmsMessageRepository,
    private realtime: AssistanceRealtimeService,
    private lifecycle: SosLifecycleService
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
  async executeBySms({
    msisdn,
    response,
    source = 'provider',
    providerMessageId,
    expectedRequestId,
  }: {
    msisdn: string
    response: string
    source?: 'provider' | 'simulator'
    providerMessageId?: string
    expectedRequestId?: number
  }) {
    // Find user by msisdn
    const user = await this.userRepository.findByMsisdn(msisdn)
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.')
    }

    if (providerMessageId) {
      const duplicate = await this.smsMessageRepository.findByProviderMessageId(providerMessageId)
      if (duplicate) {
        return {
          message: 'Mensagem já processada.',
          requestId: duplicate.jobId,
          action: 'duplicate',
        }
      }
    }

    let parsedCommand: ReturnType<typeof parseSosSmsCommand>
    try {
      parsedCommand = parseSosSmsCommand(response)
    } catch (error) {
      if (!(error instanceof BadRequestException)) throw error

      const referencedRequestId = expectedRequestId ?? extractSosRequestId(response)
      const unknownJob = referencedRequestId
        ? await this.jobRepository.findById(referencedRequestId)
        : await this.jobRepository.findLatestActionableByProfessionalId(user.id)

      if (!unknownJob || unknownJob.professionalId !== user.id) throw error

      const incomingMessage = await this.smsMessageRepository.create({
        jobId: unknownJob.id,
        professionalId: user.id,
        direction: 'inbound',
        source,
        body: response.trim(),
        providerMessageId: providerMessageId ?? null,
        metadata: { recognized: false },
      })

      this.realtime.publish({
        requestId: unknownJob.id,
        type: 'sms_received',
        status: unknownJob.status,
        resourceId: incomingMessage.id,
      })

      await this.smsService.sendUnknownSosCommandSms(msisdn, unknownJob.id, {
        simulated: source === 'simulator',
      })

      return {
        message: 'Resposta não reconhecida. Foram enviadas novas instruções.',
        requestId: unknownJob.id,
        action: 'unknown',
      }
    }

    const { command, requestId } = parsedCommand

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

    if (expectedRequestId && id !== expectedRequestId) {
      throw new BadRequestException('A mensagem não corresponde a esta conversa.')
    }

    const incomingMessage = await this.smsMessageRepository.create({
      jobId: id,
      professionalId: user.id,
      direction: 'inbound',
      source,
      body: response.trim(),
      providerMessageId: providerMessageId ?? null,
    })

    this.realtime.publish({
      requestId: id,
      type: 'sms_received',
      status: job.status,
      resourceId: incomingMessage.id,
    })

    if (command === sosSmsCommands.accept) {
      const result = await this.lifecycle.accept(id, user.id, 'sms')

      if (result.changed) {
        await this.smsService.sendSosAcceptedSms(msisdn, id, {
          simulated: source === 'simulator',
        })
      }

      return { message: 'Pedido SOS aceito com sucesso.', requestId: id, action: 'accepted' }
    }

    if (command === sosSmsCommands.reject) {
      await this.lifecycle.reject(id, user.id, 'sms')

      return { message: 'Pedido SOS recusado.', requestId: id, action: 'rejected' }
    }

    if (command === sosSmsCommands.start) {
      const result = await this.lifecycle.start(id, user.id, 'sms')

      if (result.changed) {
        await this.smsService.sendSosStartedSms(msisdn, id, {
          simulated: source === 'simulator',
        })
      }

      return { message: 'Trabalho iniciado com sucesso.', requestId: id, action: 'started' }
    }

    const result = await this.lifecycle.declareCompletion(id, user.id, 'sms')
    if (result.changed) {
      await this.smsService.sendSosCompletedSms(msisdn, id, {
        simulated: source === 'simulator',
      })
    }

    return {
      message: 'Conclusão registada. Aguardamos a confirmação do cliente.',
      requestId: id,
      action: 'completion_declared',
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

    await this.lifecycle.accept(requestId, userId, 'user')

    return {
      message: 'Pedido SOS confirmado com sucesso.',
      requestId: job.id,
    }
  }
}
