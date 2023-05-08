const EventEmitter = require('node:events')

class Emitter extends EventEmitter {}
const emitter = new Emitter()

module.exports = { emitter }
