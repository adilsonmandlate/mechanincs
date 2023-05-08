const sid = process.env.SID
const token = process.env.TOKEN
const fromNumber = process.env.SMS_FROM_NUMBER
const service = require('twilio')(sid, token)

module.exports = {
  service,
  fromNumber
}
