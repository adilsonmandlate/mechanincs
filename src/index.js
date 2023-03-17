const app = require('./main/config/app')
const env = require('./main/config/env')

app.listen(env.port, () => console.log(`Server app running on ${env.port}`))
