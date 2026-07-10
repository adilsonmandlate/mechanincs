import { defineConfig, stores } from '@adonisjs/limiter'
import type { InferLimiters } from '@adonisjs/limiter/types'

const limiterConfig = defineConfig({
  default: 'redis',
  stores: {
    /**
     * Redis store to save rate limiting data inside a
     * redis database.
     *
     * It is recommended to use a separate database for
     * the limiter connection.
     */
    redis: stores.redis({}),

    /**
     * Memory store could be used during
     * testing
     */
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
