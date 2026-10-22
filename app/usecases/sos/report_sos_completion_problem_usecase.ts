import { inject } from '@adonisjs/core/container'
import { BadRequestException } from '#exceptions/generic/bad_request_exception'
import { SosLifecycleService } from '#services/sos_lifecycle_service'
import type { CompletionDisputeReason } from '#types/assistance'
import { SmsService } from '#services/sms_service'
import { UserRepository } from '#repositories/user_repository'

@inject()
export default class ReportSosCompletionProblemUseCase {
  constructor(
    private lifecycle: SosLifecycleService,
    private smsService: SmsService,
    private userRepository: UserRepository
  ) {}

  async execute({
    requestId,
    userId,
    reason,
    description,
  }: {
    requestId: number
    userId: number
    reason: CompletionDisputeReason
    description?: string
  }) {
    if (reason === 'other' && !description?.trim()) {
      throw new BadRequestException('Descreva o problema quando seleccionar outro motivo.')
    }

    const result = await this.lifecycle.disputeCompletion({
      requestId,
      clientId: userId,
      reason,
      description,
    })

    if (result.changed && result.job.professionalId) {
      const professional = await this.userRepository.findById(result.job.professionalId)
      if (professional?.msisdn) {
        await this.smsService.sendCompletionDisputedSms(professional.msisdn, requestId)
      }
    }

    return {
      message: 'Recebemos o teu reporte. A nossa equipa irá analisar a situação.',
      requestId,
      disputeId: result.dispute.id,
    }
  }
}
