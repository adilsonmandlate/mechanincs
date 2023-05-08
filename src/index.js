const { server } = require('./main/config/app')
const env = require('./main/config/env')

server.listen(env.port, () => console.log(`Server app running on ${env.port}`))
