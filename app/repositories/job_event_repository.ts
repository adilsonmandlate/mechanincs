import JobEvent from '#models/job_event'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class JobEventRepository {
  /**
   * Creates a new job event
   */
  async create(
    data: {
      jobId: number
      eventType: 'created' | 'accepted' | 'canceled'
      userId: number
      metadata?: Record<string, any>
    },
    trx?: TransactionClientContract
  ): Promise<JobEvent> {
    return await JobEvent.create(data, { client: trx })
  }
}
