const request = require('supertest')
const app = require('../config/app')

describe('Content-Type midlleware', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('should return default content type as json', async () => {
    app.get('/test-content-type', (req, res) => {
      res.send('')
    })

    await request(app).get('/test-content-type').expect('content-type', /json/)
  })

  it('should return xml when forced to', async () => {
    app.get('/test-content-xml', (req, res) => {
      res.type('xml')
      res.send('')
    })

    await request(app).get('/test-content-xml').expect('content-type', /xml/)
  })
})
