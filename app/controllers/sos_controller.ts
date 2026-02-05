import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import FindNearbyMechanicsUseCase from '#usecases/sos/find_nearby_mechanics_usecase'
import CreateSosRequestUseCase from '#usecases/sos/create_sos_request_usecase'
import GetSosRequestUseCase from '#usecases/sos/get_sos_request_usecase'
import ConfirmSosRequestUseCase from '#usecases/sos/confirm_sos_request_usecase'
import RejectSosRequestUseCase from '#usecases/sos/reject_sos_request_usecase'
import CancelSosRequestUseCase from '#usecases/sos/cancel_sos_request_usecase'
import { ProfessionalProfileRepository } from '#repositories/professional_profile_repository'
import { findNearbyMechanicsValidator } from '#validators/sos/find_nearby_mechanics_validator'
import { createSosRequestValidator } from '#validators/sos/create_sos_request_validator'

export default class SosController {
  @inject()
  async findNearby(
    { request, response }: HttpContext,
    findNearbyMechanicsUseCase: FindNearbyMechanicsUseCase
  ) {
    const payload = await request.validateUsing(findNearbyMechanicsValidator)
    const result = await findNearbyMechanicsUseCase.execute({ data: payload })

    return response.ok(result)
  }

  @inject()
  async create(
    { request, response, auth }: HttpContext,
    createSosRequestUseCase: CreateSosRequestUseCase
  ) {
    const user = auth.getUserOrFail()
    const payload = await request.validateUsing(createSosRequestValidator)
    const result = await createSosRequestUseCase.execute({ userId: user.id, data: payload })
    return response.created(result)
  }

  @inject()
  async get({ params, response, auth }: HttpContext, getSosRequestUseCase: GetSosRequestUseCase) {
    const user = auth.getUserOrFail()
    const requestId = Number.parseInt(params.id)
    const result = await getSosRequestUseCase.execute({ requestId, userId: user.id })
    return response.ok(result)
  }

  /**
   * Webhook to receive SMS responses (1 = accept, 2 = reject)
   * This endpoint should be called by SMS service provider when professional responds
   */
  @inject()
  async handleSmsResponse(
    { request, response }: HttpContext,
    confirmSosRequestUseCase: ConfirmSosRequestUseCase
  ) {
    // Extract msisdn and message from SMS webhook payload
    // Format depends on SMS provider (Twilio, AWS SNS, etc.)
    const msisdn = request.input('From') || request.input('from') || request.input('msisdn')
    const message = request.input('Body') || request.input('body') || request.input('message')

    if (!msisdn || !message) {
      return response.badRequest({ message: 'Msisdn e mensagem são obrigatórios.' })
    }

    const result = await confirmSosRequestUseCase.executeBySms({
      msisdn,
      response: message,
    })

    return response.ok(result)
  }

  @inject()
  async confirm(
    { params, response, auth }: HttpContext,
    confirmSosRequestUseCase: ConfirmSosRequestUseCase,
    professionalProfileRepository: ProfessionalProfileRepository
  ) {
    const user = auth.getUserOrFail()
    const requestId = Number.parseInt(params.id)

    // Get professional profile to verify user is a professional
    const professionalProfile = await professionalProfileRepository.findByUserId(user.id)

    if (!professionalProfile) {
      return response.forbidden({ message: 'Apenas profissionais podem confirmar pedidos.' })
    }

    const result = await confirmSosRequestUseCase.executeByUser({
      requestId,
      userId: user.id,
    })
    return response.ok(result)
  }

  @inject()
  async reject(
    { params, response, auth }: HttpContext,
    rejectSosRequestUseCase: RejectSosRequestUseCase,
    professionalProfileRepository: ProfessionalProfileRepository
  ) {
    const user = auth.getUserOrFail()
    const requestId = Number.parseInt(params.id)

    // Get professional profile to verify user is a professional
    const professionalProfile = await professionalProfileRepository.findByUserId(user.id)

    if (!professionalProfile) {
      return response.forbidden({ message: 'Apenas profissionais podem recusar pedidos.' })
    }

    const result = await rejectSosRequestUseCase.execute({
      requestId,
      userId: user.id,
    })
    return response.ok(result)
  }

  @inject()
  async cancel(
    { params, response, auth }: HttpContext,
    cancelSosRequestUseCase: CancelSosRequestUseCase
  ) {
    const user = auth.getUserOrFail()
    const requestId = Number.parseInt(params.id)
    const result = await cancelSosRequestUseCase.execute({ requestId, userId: user.id })
    return response.ok(result)
  }
}
