import { inject } from '@adonisjs/core/container'
import { JobRepository } from '#repositories/job_repository'

@inject()
export default class GetActiveSosRequestUseCase {
  constructor(private jobRepository: JobRepository) {}

  async execute({ userId }: { userId: number }) {
    const job = await this.jobRepository.findActiveByUserId(userId)

    if (!job) {
      return null
    }

    return {
      requestId: job.id,
      status: job.status,
    }
  }
}
