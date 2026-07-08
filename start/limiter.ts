/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(100).every('1 minute')
})

export const authThrottle = limiter.define('auth', () => {
  return limiter.allowRequests(20).every('1 minute')
})

export const loginThrottle = limiter.define('login', () => {
  return limiter.allowRequests(50).every('1 minute')
})

export const resetThrottle = limiter.define('password-reset', () => {
  return limiter.allowRequests(5).every('1 minute')
})

export const sosNearbyThrottle = limiter.define('sos-nearby', () => {
  return limiter.allowRequests(60).every('1 minute')
})

export const smsWebhookThrottle = limiter.define('sms-webhook', () => {
  return limiter.allowRequests(30).every('1 minute')
})

export const sosAuthenticatedThrottle = limiter.define('sos-authenticated', () => {
  return limiter.allowRequests(120).every('1 minute')
})
