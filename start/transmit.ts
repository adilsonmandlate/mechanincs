import transmit from '@adonisjs/transmit/services/main'
import Job from '#models/job'
import env from '#start/env'

async function userIsAdmin(userId: number) {
  const user = await import('#models/user').then(({ default: User }) => User.find(userId))
  if (!user) return false

  await user.load('roles')
  return user.roles.some((role) => role.role === 'admin')
}

transmit.authorize<{ requestId: string }>(
  'assistance/requests/:requestId',
  async (ctx, { requestId }) => {
    const user = ctx.auth.user
    if (!user) return false

    const job = await Job.find(Number(requestId))
    if (!job) return false

    return job.userId === user.id || job.professionalId === user.id || userIsAdmin(user.id)
  }
)

transmit.authorize('demo/sms/inbox', async (ctx) => {
  const user = ctx.auth.user
  return Boolean(
    user && env.get('DEMO_SMS_SIMULATOR_ENABLED', false) && (await userIsAdmin(user.id))
  )
})

transmit.authorize<{ requestId: string }>(
  'demo/sms/requests/:requestId',
  async (ctx, { requestId }) => {
    const user = ctx.auth.user
    if (!user || !env.get('DEMO_SMS_SIMULATOR_ENABLED', false)) return false

    const [job, isAdmin] = await Promise.all([Job.find(Number(requestId)), userIsAdmin(user.id)])
    return Boolean(job && isAdmin)
  }
)
