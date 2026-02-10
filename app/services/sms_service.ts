import logger from '@adonisjs/core/services/logger'

/**
 * SMS Service
 *
 * Service for sending SMS messages. In production, integrate with
 * services like Twilio, AWS SNS, or similar.
 */
export class SmsService {
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
    clientName: string,
    problemDescription: string,
    requestId: number
  ): Promise<void> {
    const message =
      `Olá, foram requisitados seus serviços por ${clientName}}\n` +
      `Problema: ${problemDescription}\n\n` +
      `Responda com:\n` +
      `1 ${requestId} = aceitar\n` +
      `2 ${requestId} = recusar`

    logger.info(`[SmsService] SOS request SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)

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
  async sendSosAcceptedSms(msisdn: string, requestId: number): Promise<void> {
    const message =
      `Você aceitou o SOS #${requestId}.\n` + `Quando começar o trabalho, responda: 3 ${requestId}`

    logger.info(`[SmsService] SOS accepted SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
  }

  async sendSosStartedSms(msisdn: string, requestId: number): Promise<void> {
    const message =
      `Trabalho iniciado no SOS #${requestId}.\n` + `Quando terminar, responda: 4 ${requestId}`

    logger.info(`[SmsService] SOS started SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
  }

  async sendSosCompletedSms(msisdn: string, requestId: number): Promise<void> {
    const message = `SOS #${requestId} concluído. Obrigado.`

    logger.info(`[SmsService] SOS completed SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)
  }
}
