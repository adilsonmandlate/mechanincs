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
  async sendSosRequestSms(msisdn: string, clientName: string): Promise<void> {
    const message = `Olá, foram requisitados seus serviços por ${clientName}. Para aceitar este trabalho, responda essa SMS com 1. Para recusar responda com 2.`

    logger.info(`[SmsService] SOS request SMS would be sent to ${msisdn}`)
    logger.info(`[SmsService] Message: ${message}`)

    // In production, use something like:
    // await twilio.messages.create({
    //   to: msisdn,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   body: message
    // })
  }
}
