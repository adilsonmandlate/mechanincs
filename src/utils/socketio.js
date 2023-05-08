const socketio = require('socket.io')

let io

module.exports = {
  init: function (server) {
    io = socketio(server)
    return io
  },
  getIO: function (namespace) {
    if (!io) {
      throw new Error('Cannot get Socket instance before initialization')
    }

    return io.of(namespace)
  }
}
