/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import {
  authThrottle,
  loginThrottle,
  resetThrottle,
  smsWebhookThrottle,
  sosAuthenticatedThrottle,
  sosNearbyThrottle,
} from './limiter.js'
const AuthController = () => import('#controllers/auth_controller')
const ProfessionController = () => import('#controllers/profession_controller')
const SosController = () => import('#controllers/sos_controller')

// Health check
router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Auth routes
router
  .group(() => {
    // Registration
    router.post('/register/client', [AuthController, 'registerClient'])
    router.post('/register/professional', [AuthController, 'registerProfessional'])

    // Authentication
    router.post('/login', [AuthController, 'login']).use(loginThrottle)

    // Password reset
    router.post('/forgot-password', [AuthController, 'forgotPassword']).use(resetThrottle)
    router.post('/reset-password', [AuthController, 'resetPassword']).use(resetThrottle)

    // Email/SMS verification
    router.post('/confirm', [AuthController, 'confirmUser'])
  })
  .prefix('/auth')
  .use(authThrottle)

// Profession routes
router
  .group(() => {
    router.get('/', [ProfessionController, 'index'])
    router.get('/:id/expertises', [ProfessionController, 'expertises'])
    router.get('/:id', [ProfessionController, 'show'])

    router
      .group(() => {
        router.post('/', [ProfessionController, 'store'])
        router.put('/:id', [ProfessionController, 'update'])
        router.patch('/:id/suspend', [ProfessionController, 'suspend'])
        router.delete('/:id', [ProfessionController, 'destroy'])
      })
      .use([middleware.auth(), middleware.admin()])
  })
  .prefix('/professions')

// SOS routes
router
  .group(() => {
    // Public route - find nearby mechanics
    router.get('/nearby', [SosController, 'findNearby']).use(sosNearbyThrottle)

    // Public route - SMS webhook (receives SMS responses)
    router.post('/sms/webhook', [SosController, 'handleSmsResponse']).use(smsWebhookThrottle)

    // Protected routes - require authentication
    router
      .group(() => {
        router.post('/request', [SosController, 'create'])
        router.get('/request/active', [SosController, 'getActive'])
        router.get('/request/:id', [SosController, 'get'])
        router.post('/request/:id/confirm', [SosController, 'confirm'])
        router.post('/request/:id/reject', [SosController, 'reject'])
        router.post('/request/:id/cancel', [SosController, 'cancel'])
        router.post('/request/:id/rate', [SosController, 'rate'])
      })
      .use(middleware.auth())
      .use(sosAuthenticatedThrottle)
  })
  .prefix('/sos')
