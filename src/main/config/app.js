const http = require('http')
const app = require('express')()
const setupApp = require('./setup')
const setupRoutes = require('./routes')
const socket = require('../../utils/socketio')

const server = http.createServer(app)

setupApp(app)
setupRoutes(app)

/**
 * Register here all socket namespaces
 */
socket.init(server).of('/professionals')

module.exports = { server }
