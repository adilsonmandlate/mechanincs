import JobEvent from '#models/job_event'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { JobEventType } from '#types/assistance'

export class JobEventRepository {
  /**
   * Creates a new job event
   */
  async create(
    data: {
      jobId: number
      eventType: JobEventType
      userId: number
      metadata?: Record<string, any>
    },
    trx?: TransactionClientContract
  ): Promise<JobEvent> {
    return await JobEvent.create(data, { client: trx })
  }
}
