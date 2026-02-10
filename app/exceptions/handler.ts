import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { AppException } from '#exceptions/app_exception'
import logger from '@adonisjs/core/services/logger'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: any, ctx: HttpContext) {
    const { response } = ctx

    if (error.code === 'E_ROUTE_NOT_FOUND') {
      logger.warn(`Rota não encontrada: ${ctx.request.method()}: ${ctx.request.url()}`)
      return response.status(404).send({
        message: 'Recurso não encontrado',
        code: error.code,
      })
    }

    if (error instanceof AppException) {
      return response.status(error.status).json({
        message: error.message,
        code: error.code,
        ...(this.debug && { stack: error.stack }),
      })
    }

    logger.error(error)
    return response.status(500).json({
      message: 'Erro interno do servidor',
      ...(this.debug && { code: 'E_INTERNAL_SERVER_ERROR' }),
      ...(this.debug && { error: error.message }),
    })
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
