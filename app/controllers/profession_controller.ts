import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import CreateProfessionUseCase from '#usecases/profession/create_profession_usecase'
import UpdateProfessionUseCase from '#usecases/profession/update_profession_usecase'
import SuspendProfessionUseCase from '#usecases/profession/suspend_profession_usecase'
import DeleteProfessionUseCase from '#usecases/profession/delete_profession_usecase'
import ListProfessionsUseCase from '#usecases/profession/list_professions_usecase'
import GetProfessionUseCase from '#usecases/profession/get_profession_usecase'
import { createProfessionValidator } from '#validators/profession/create_profession_validator'
import { updateProfessionValidator } from '#validators/profession/update_profession_validator'

export default class ProfessionController {
  /**
   * List all professions
   */
  @inject()
  async index(ctx: HttpContext, listProfessionsUseCase: ListProfessionsUseCase) {
    const result = await listProfessionsUseCase.execute()
    return ctx.response.json(result)
  }

  /**
   * Get a profession by ID
   */
  @inject()
  async show(ctx: HttpContext, getProfessionUseCase: GetProfessionUseCase) {
    const { params } = ctx
    const result = await getProfessionUseCase.execute({ id: params.id })
    return ctx.response.json(result)
  }

  /**
   * Create a new profession
   */
  @inject()
  async store(ctx: HttpContext, createProfessionUseCase: CreateProfessionUseCase) {
    const { request, response } = ctx
    const data = await request.validateUsing(createProfessionValidator)
    const result = await createProfessionUseCase.execute({ data })
    return response.status(201).json(result)
  }

  /**
   * Update a profession
   */
  @inject()
  async update(ctx: HttpContext, updateProfessionUseCase: UpdateProfessionUseCase) {
    const { request, response, params } = ctx
    const data = await request.validateUsing(updateProfessionValidator)
    const result = await updateProfessionUseCase.execute({ id: params.id, data })
    return response.json(result)
  }

  /**
   * Suspend a profession
   */
  @inject()
  async suspend(ctx: HttpContext, suspendProfessionUseCase: SuspendProfessionUseCase) {
    const { response, params } = ctx
    const result = await suspendProfessionUseCase.execute({ id: params.id })
    return response.json(result)
  }

  /**
   * Delete a profession
   */
  @inject()
  async destroy(ctx: HttpContext, deleteProfessionUseCase: DeleteProfessionUseCase) {
    const { response, params } = ctx
    const result = await deleteProfessionUseCase.execute({ id: params.id })
    return response.json(result)
  }
}
