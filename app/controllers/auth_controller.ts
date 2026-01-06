import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import RegisterClientUseCase from '#usecases/auth/register_client_usecase'
import RegisterProfessionalUseCase from '#usecases/auth/register_professional_usecase'
import LoginUserUseCase from '#usecases/auth/login_user_usecase'
import ForgotPasswordUseCase from '#usecases/auth/forgot_password_usecase'
import ResetPasswordUseCase from '#usecases/auth/reset_password_usecase'
import ConfirmUserUseCase from '#usecases/auth/confirm_user_usecase'
import { registerClientValidator } from '#validators/auth/register_client_validator'
import { registerProfessionalValidator } from '#validators/auth/register_professional_validator'
import { loginValidator } from '#validators/auth/login_validator'
import { forgotPasswordValidator } from '#validators/auth/forgot_password_validator'
import { resetPasswordValidator } from '#validators/auth/reset_password_validator'
import { confirmUserValidator } from '#validators/auth/confirm_user_validator'

export default class AuthController {
  /**
   * Register a new client
   */
  @inject()
  async registerClient(
    { request, response }: HttpContext,
    registerClientUseCase: RegisterClientUseCase
  ) {
    const data = await request.validateUsing(registerClientValidator)
    const result = await registerClientUseCase.execute({ data })
    return response.status(201).json(result)
  }

  /**
   * Register a new professional
   */
  @inject()
  async registerProfessional(
    { request, response }: HttpContext,
    registerProfessionalUseCase: RegisterProfessionalUseCase
  ) {
    const data = await request.validateUsing(registerProfessionalValidator)
    const result = await registerProfessionalUseCase.execute({ data })
    return response.status(201).json(result)
  }

  /**
   * Login user
   */
  @inject()
  async login({ request, response }: HttpContext, loginUserUseCase: LoginUserUseCase) {
    const data = await request.validateUsing(loginValidator)
    const result = await loginUserUseCase.execute({ data })
    return response.json(result)
  }

  /**
   * Forgot password
   */
  @inject()
  async forgotPassword(
    { request, response }: HttpContext,
    forgotPasswordUseCase: ForgotPasswordUseCase
  ) {
    const data = await request.validateUsing(forgotPasswordValidator)
    const result = await forgotPasswordUseCase.execute(data)
    return response.json(result)
  }

  /**
   * Reset password
   */
  @inject()
  async resetPassword(
    { request, response }: HttpContext,
    resetPasswordUseCase: ResetPasswordUseCase
  ) {
    const data = await request.validateUsing(resetPasswordValidator)
    const result = await resetPasswordUseCase.execute(data)
    return response.json(result)
  }

  /**
   * Confirm user email/SMS
   */
  @inject()
  async confirmUser({ request, response }: HttpContext, confirmUserUseCase: ConfirmUserUseCase) {
    const data = await request.validateUsing(confirmUserValidator)
    const result = await confirmUserUseCase.execute(data)
    return response.json(result)
  }
}
