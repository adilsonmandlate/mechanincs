const request = require('supertest')
const app = require('../config/app')

describe('CORS Middleware', () => {
  it('should enable CORS', async () => {
    app.get('/test-cors', (req, res) => {
      res.send('')
    })

    const res = await request(app).get('/test-cors')
    expect(res.header['access-control-allow-origin']).toEqual('*')
    expect(res.header['access-control-allow-methods']).toEqual('*')
    expect(res.header['access-control-allow-headers']).toEqual('*')
  })
})
