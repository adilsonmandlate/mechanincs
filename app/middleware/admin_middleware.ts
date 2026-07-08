import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.getUserOrFail()
    await user.load('roles')

    if (!user.roles.some((role) => role.role === 'admin')) {
      return ctx.response.forbidden({
        message: 'Apenas administradores podem executar esta ação.',
        code: 'E_FORBIDDEN',
      })
    }

    return next()
  }
}
