import env from '#start/env'
import { defineConfig } from '@adonisjs/transmit'
import { redis } from '@adonisjs/transmit/transports/redis'

export default defineConfig({
  pingInterval: '25s',
  transport: {
    driver: redis({
      host: env.get('REDIS_HOST'),
      port: env.get('REDIS_PORT'),
      password: env.get('REDIS_PASSWORD') || undefined,
      db: env.get('REDIS_DB', 0),
      keyPrefix: env.get('REDIS_KEY_PREFIX', ''),
    }),
    channel: 'mechanics::transmit',
  },
})
