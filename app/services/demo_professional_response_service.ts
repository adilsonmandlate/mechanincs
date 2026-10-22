import { inject } from '@adonisjs/core/container'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import { SosLifecycleService } from '#services/sos_lifecycle_service'

export type DemoProfessionalResponse = 'accepted' | 'rejected'

@inject()
export class DemoProfessionalResponseService {
  constructor(private lifecycle: SosLifecycleService) {}

  async respond({
    jobId,
    professionalUserId,
  }: {
    jobId: number
    professionalUserId: number
  }): Promise<DemoProfessionalResponse | null> {
    if (!env.get('DEMO_PROFESSIONAL_RESPONSE_SIMULATION', false)) {
      return null
    }

    const positionInBatch = ((jobId - 1) % 5) + 1
    const response: DemoProfessionalResponse =
      positionInBatch === 3 || positionInBatch === 5 ? 'rejected' : 'accepted'

    if (response === 'accepted') {
      await this.lifecycle.accept(jobId, professionalUserId, 'demo_simulation')
    } else {
      await this.lifecycle.reject(jobId, professionalUserId, 'demo_simulation')
    }

    logger.info(
      {
        jobId,
        professionalUserId,
        response,
        positionInBatch,
      },
      '[DemoProfessionalResponse] Simulated professional response'
    )

    return response
  }
}
