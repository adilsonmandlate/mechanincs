import { inject } from '@adonisjs/core/container'
import { SosLifecycleService } from '#services/sos_lifecycle_service'
import { SmsService } from '#services/sms_service'
import { UserRepository } from '#repositories/user_repository'

@inject()
export default class ConfirmSosCompletionUseCase {
  constructor(
    private lifecycle: SosLifecycleService,
    private smsService: SmsService,
    private userRepository: UserRepository
  ) {}

  async execute({ requestId, userId }: { requestId: number; userId: number }) {
    const result = await this.lifecycle.confirmCompletion(requestId, userId)

    if (result.changed && result.job.professionalId) {
      const professional = await this.userRepository.findById(result.job.professionalId)
      if (professional?.msisdn) {
        await this.smsService.sendCustomerConfirmedCompletionSms(professional.msisdn, requestId)
      }
    }

    return { message: 'Conclusão confirmada com sucesso.', requestId }
  }
}
