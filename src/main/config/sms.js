const sid = 'AC54341ac24887cb515e072dc9fb5ac9bc'
const token = '62b6173996a3b88a70ecece085a518d7'
const twilio = require('twilio')(sid, token)

module.exports = twilio
