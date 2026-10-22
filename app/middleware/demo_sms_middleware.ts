import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import env from '#start/env'

export default class DemoSmsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!env.get('DEMO_SMS_SIMULATOR_ENABLED', false)) {
      return ctx.response.notFound({ message: 'Recurso não encontrado.' })
    }

    const user = ctx.auth.getUserOrFail()
    await user.load('roles')

    if (!user.roles.some((role) => role.role === 'admin')) {
      return ctx.response.forbidden({ message: 'Acesso não autorizado.' })
    }

    return next()
  }
}
