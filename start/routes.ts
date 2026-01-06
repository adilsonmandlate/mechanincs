/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const ProfessionController = () => import('#controllers/profession_controller')

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
    router.post('/login', [AuthController, 'login'])

    // Password reset
    router.post('/forgot-password', [AuthController, 'forgotPassword'])
    router.post('/reset-password', [AuthController, 'resetPassword'])

    // Email/SMS verification
    router.post('/confirm', [AuthController, 'confirmUser'])
  })
  .prefix('/api/auth')

// Profession routes
router
  .group(() => {
    router.get('/', [ProfessionController, 'index'])
    router.get('/:id', [ProfessionController, 'show'])
    router.post('/', [ProfessionController, 'store'])
    router.put('/:id', [ProfessionController, 'update'])
    router.patch('/:id/suspend', [ProfessionController, 'suspend'])
    router.delete('/:id', [ProfessionController, 'destroy'])
  })
  .prefix('/api/professions')
