import logger from '@adonisjs/core/services/logger'
import { inject } from '@adonisjs/core/container'
import { SmsMessageRepository } from '#repositories/sms_message_repository'
import { JobRepository } from '#repositories/job_repository'
import { AssistanceRealtimeService } from '#services/assistance_realtime_service'
import { getAvailableSosSmsCommands } from '#services/sos_sms_protocol'

/**
 * SMS Service
 *
 * Service for sending SMS messages. In production, integrate with
 * services like Twilio, AWS SNS, or similar.
 */
@inject()
export class SmsService {
  constructor(
    private smsMessageRepository: SmsMessageRepository,
    private jobRepository: JobRepository,
    private realtime: AssistanceRealtimeService
  ) {}

  private async recordJobMessage(jobId: number, body: string, metadata?: Record<string, unknown>) {
    const job = await this.jobRepository.findById(jobId)
    if (!job) return

    const smsMessage = await this.smsMessageRepository.create({
      jobId,
      professionalId: job.professionalId,
      direction: 'outbound',
      source: 'system',
      body,
      metadata,
    })

    this.realtime.publish({
      requestId: jobId,
      type: 'sms_sent',
      status: job.status,
      resourceId: smsMessage.id,
    })
  }

  private async getSosLabel(requestId: number) {
    const job = await this.jobRepository.findByIdWithClient(requestId)
    if (!job?.client) return `SOS ${requestId}`

    const firstName = job.client.name.trim().split(/\s+/)[0]
    return `SOS ${job.client.gender === 'female' ? 'da' : 'do'} ${firstName}`
  }
  /**
   * Send verification SMS
   */
  async sendVerificationSms(msisdn: string, code: string): Promise<void> {
    // TODO: Integrate with SMS service provider
    logger.info(`[SmsService] Verification SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Verification code: ${code}`)

    // In production, use something like:
    // await twilio.messages.create({
    //   to: msisdn,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: `Your verification code is: ${code}`
    // })
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSms(msisdn: string, code: string): Promise<void> {
    // TODO: Integrate with SMS service provider
    logger.info(`[SmsService] Password reset SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Reset code: ${code}`)

    // In production, use something like:
    // await twilio.messages.create({
    //   to: msisdn,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: `Your password reset code is: ${code}`
    // })
  }

  /**
   * Send SOS request SMS to professional
   */
  async sendSosRequestSms(
    msisdn: string,
    problemDescription: string,
    requestId: number
  ): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message =
      `Olá, recebeste um pedido para o ${sosLabel}.\n` +
      `Problema: ${problemDescription}\n\n` +
      `Responda com:\n` +
      `ACEITAR ${requestId}\n` +
      `RECUSAR ${requestId}`

    logger.info(`[SmsService] SOS request SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message)

    // In production, use something like:
    // await twilio.messages.create({
    //   to: msisdn,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: message
    // })
  }

  /**
   * Send SOS mechanic help/commands SMS
   */
  async sendSosAcceptedSms(
    msisdn: string,
    requestId: number,
    options: { simulated?: boolean } = {}
  ): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message =
      `Aceitaste o ${sosLabel}.\n` + `Quando começares o trabalho, responde: COMECAR ${requestId}`

    logger.info(`[SmsService] SOS accepted SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message, {
      simulatedDelivery: options.simulated ?? false,
    })
  }

  async sendSosStartedSms(
    msisdn: string,
    requestId: number,
    options: { simulated?: boolean } = {}
  ): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message =
      `Trabalho iniciado no ${sosLabel}.\n` + `Quando terminares, responde: TERMINAR ${requestId}`

    logger.info(`[SmsService] SOS started SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message, {
      simulatedDelivery: options.simulated ?? false,
    })
  }

  async sendSosCompletedSms(
    msisdn: string,
    requestId: number,
    options: { simulated?: boolean } = {}
  ): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message = `Conclusão do ${sosLabel} registada. O cliente irá validar o trabalho realizado.`

    logger.info(`[SmsService] SOS completed SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message, {
      simulatedDelivery: options.simulated ?? false,
    })
  }

  async sendCustomerConfirmedCompletionSms(msisdn: string, requestId: number): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message = `O cliente confirmou a conclusão do ${sosLabel} e validou o trabalho realizado.`

    logger.info(`[SmsService] Customer confirmation SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message)
  }

  async sendCompletionDisputedSms(msisdn: string, requestId: number): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message =
      `O cliente registou uma reclamação sobre o ${sosLabel}. ` +
      'A equipa Mechanics irá analisar a situação.'

    logger.info(`[SmsService] Completion dispute SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message)
  }

  async sendCustomerCanceledSosSms(msisdn: string, requestId: number): Promise<void> {
    const sosLabel = await this.getSosLabel(requestId)
    const message = `O cliente cancelou o ${sosLabel}. Não é necessário continuar com esta assistência.`

    logger.info(`[SmsService] Customer cancellation SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message)
  }

  async sendUnknownSosCommandSms(
    msisdn: string,
    requestId: number,
    options: { simulated?: boolean } = {}
  ): Promise<void> {
    const job = await this.jobRepository.findById(requestId)
    if (!job) return

    const sosLabel = await this.getSosLabel(requestId)
    const instructions = getAvailableSosSmsCommands(job.status, requestId)
      .map((command) => command.message)
      .join(' ou ')
    const message = instructions
      ? `Não reconhecemos a tua resposta para o ${sosLabel}. Responde com ${instructions}.`
      : `Não reconhecemos a tua resposta para o ${sosLabel}. Neste momento não é necessária outra acção por SMS.`

    logger.info(`[SmsService] Unknown SOS command SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
    await this.recordJobMessage(requestId, message, {
      simulatedDelivery: options.simulated ?? false,
    })
  }
}
