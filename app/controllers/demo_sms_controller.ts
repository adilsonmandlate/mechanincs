import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import { DemoSmsConversationService } from '#services/demo_sms_conversation_service'
import ConfirmSosRequestUseCase from '#usecases/sos/confirm_sos_request_usecase'
import {
  listDemoSmsConversationsValidator,
  sendDemoSmsMessageValidator,
} from '#validators/demo_sms_validator'

export default class DemoSmsController {
  @inject()
  async index({ request, response, auth }: HttpContext, conversations: DemoSmsConversationService) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(listDemoSmsConversationsValidator)
    const result = await conversations.list({
      operatorId: user.id,
      filter: payload.filter ?? 'all',
      search: payload.search,
    })
    return response.ok(result)
  }

  @inject()
  async show({ params, response, auth }: HttpContext, conversations: DemoSmsConversationService) {
    const user = auth.getUserOrFail()
    const result = await conversations.get(Number(params.id), user.id)
    return response.ok(result)
  }

  @inject()
  async send(
    { params, request, response }: HttpContext,
    conversations: DemoSmsConversationService,
    confirmSosRequestUseCase: ConfirmSosRequestUseCase
  ) {
    const requestId = Number(params.id)
    const payload = await request.validateUsing(sendDemoSmsMessageValidator)
    const { professional } = await conversations.getProfessionalForRequest(requestId)

    const result = await confirmSosRequestUseCase.executeBySms({
      msisdn: professional.msisdn,
      response: payload.body,
      source: 'simulator',
      expectedRequestId: requestId,
    })

    return response.ok(result)
  }

  @inject()
  async disputes({ response }: HttpContext, conversations: DemoSmsConversationService) {
    return response.ok(await conversations.listDisputes())
  }
}
