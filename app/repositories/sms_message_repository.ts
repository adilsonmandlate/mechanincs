import SmsMessage from '#models/sms_message'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class SmsMessageRepository {
  async create(
    data: {
      jobId: number
      professionalId: number | null
      direction: 'outbound' | 'inbound'
      source: 'system' | 'provider' | 'simulator'
      body: string
      providerMessageId?: string | null
      metadata?: Record<string, unknown> | null
    },
    trx?: TransactionClientContract
  ) {
    return SmsMessage.create(data, { client: trx })
  }

  async findByProviderMessageId(providerMessageId: string) {
    return SmsMessage.findBy('providerMessageId', providerMessageId)
  }
}
